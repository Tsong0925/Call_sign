<!--
* @FileDescription: 一级屏展示页面
* @router: generalScreen
* @Author: 刘润泽
* @Date: 2023-03-13
* @LastEditors: 刘润泽、王欣
* @LastEditTime：2023-04-11
-->
<template>
	<div class="general_screen">
		<div class="screen_header">
			<img src="/src/assets/images/logo/hospital_logo.png" alt="" />
			<span class="hospital_name">安康市中心医院</span>
			<div class="time">{{ time.timeInfo }}</div>
			<div class="date">{{ time.dateInfo }}</div>
			<div class="week">{{ time.weekInfo }}</div>
			<div class="ip">编号：{{ showIp }}</div>
		</div>
		<div class="screen_main">
			<el-table :data="screenData.slice((currentPage - 1) * 5, currentPage * 5)" style="width: 100%">
				<el-table-column align="left" width="420" prop="consultingroomName" label="诊室"></el-table-column>
				<el-table-column align="left" width="170" label="医生" prop="staffName"></el-table-column>
				<el-table-column align="left" label="就诊人" width="260">
					<template v-slot="scope">
						<span style="color: #fffa53">
							{{ scope.row.appointVisitno ? scope.row.appointVisitno + "-" + formatName(scope.row.patientName) : "" }}
						</span>
					</template>
				</el-table-column>
				<el-table-column align="center" label="候诊队列">
					<template v-slot="scope">
						<el-carousel :interval="5000" arrow="never">
							<el-carousel-item v-for="(item, index) in scope.row.waitingList" :key="item" :loop="false">
								<div style="display: inline-block; width: 250px" v-for="(subItem, index) in item">
									{{ subItem }}
								</div>
							</el-carousel-item>
						</el-carousel>
					</template>
				</el-table-column>
				<el-table-column align="center" label="过号队列" width="300">
					<template v-slot="scope">
						<el-carousel :interval="5000" arrow="never">
							<el-carousel-item v-for="(item, index) in scope.row.overList" :key="item" :loop="false">
								<div style="display: inline-block; width: 260px" v-for="(subItem, index) in item">
									{{ subItem }}
								</div>
							</el-carousel-item>
						</el-carousel>
					</template>
				</el-table-column>
			</el-table>
		</div>
		<div class="screen_footer">
			<div class="marquee">
				<p>温馨提示，请保持安静有序排队!</p>
			</div>
		</div>
		<el-dialog v-model="dialogVisible" width="40%" align-center :show-close="false" :close-on-click-modal="false">
			<p>
				请
				<span>{{ showVisitInfo.appointVisitno + "-" + formatName(showVisitInfo.patientName) }}</span>
			</p>
			<p>
				到
				<span>{{ showVisitInfo.visitRoom }}</span>
				就诊
			</p>
		</el-dialog>
	</div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import { socket } from "@/utils/websocket";
import { formatName, reloadPage, WS_URL } from "@/utils/util";
import { findLanguageType, playSound } from "@/utils/sound";

const { proxy } = getCurrentInstance() as any;
//时间
let time = reactive({
	dateInfo: "", //日期
	weekInfo: "", //星期
	week: ["日", "一", "二", "三", "四", "五", "六"],
	timeInfo: "", //时间
});
//展示IP
let showIp = ref();
//屏幕展示数据数组
let screenData = reactive<any[]>([]);
//websocket链接数组
let websocketList = ref<any>([]);
//提示框展示flag
let dialogVisible = ref(false);
//提示框展示当前就诊人信息
let showVisitInfo = reactive({
	appointVisitno: "",
	patientName: "",
	visitRoom: "",
});
//通知提示框展示队列
let noticeList: any[] = [];
let timer: any;

//当前页数
let currentPage = ref(1);
onMounted(() => {
	//获取并截取ip
	let ip = window.location.hostname;
	let index = ip.indexOf(".", ip.indexOf(".") + 1);
	showIp.value = ip.substring(index + 1);
	//开启时间显示定时器
	timer = setInterval(() => {
		let date: Date = new Date();
		let _week = Number(dayjs(date).format("d"));
		time.weekInfo = "星期" + time.week[_week];
		time.dateInfo = dayjs(date).format("YYYY.MM.DD");
		time.timeInfo = dayjs(date).format("HH:mm");
	}, 1000);

	// 等待触发voiceschanged事件才能正常获取语音列表，否则获取不到任何值（可能是chrome独有问题）
	window.speechSynthesis.addEventListener("voiceschanged", () => {
		findLanguageType();
	});

	//建立websocket连接
	proxy.$axios.get(`/getIp`).then((res: any) => {
		let ip = res.data.data;
		//获取并截取ip
		let index = ip.indexOf(".", ip.indexOf(".") + 1);
		showIp.value = ip.substring(index + 1);
		//proxy.$axios.get(`/hospital/selectByIp?ip=${ip}`).then((res: any) => {
		proxy.$axios.get(`/hospital/selectByIp?ip=192.168.15.255`).then((res: any) => {
			let tempData = res.data.data;
            console.log(tempData);
			tempData?.forEach((item: any, index: number) => {
				if (item?.consultingroomId) {
					screenData[index] = { ...tempData[index], appointVisitno: "", patientName: "" };
					let websocket = socket.createWebSocket(`${WS_URL}/websocket/${item?.consultingroomId}/1`, (message: any) => {
						let officeQueue = JSON.parse(message.data);
						//判断是否刷新页面
						reloadPage(officeQueue);
						//第一种为医护端叫号和重呼，第二种为his叫号器
						if (
							(officeQueue.visitPatients.length &&
								officeQueue.visitPatients[0].queueStats == "03" &&
								officeQueue.source !== "checkin") ||
							(officeQueue.visitPatients.length && officeQueue.source === "againCall")
						) {
							addList(officeQueue.visitPatients[0]);
						}
						//测试跑马灯数据
						loadData(officeQueue.waitingQueue, screenData[index], "waitingList");
						loadData(officeQueue.overNumQueue, screenData[index], "overList");
						officeQueue.visitPatients?.forEach((patientItem: any) => {
							if (patientItem.realityConsultingroomId === patientItem.consultingroomId) {
								screenData[index].patientName = patientItem.patientName;
								screenData[index].appointVisitno = patientItem.appointVisitno;
							}
						});
					});
					websocketList.value.push(websocket);
				}
			});
            //清楚定时器并且诊室定时翻页
			if (generalTimer) {
				clearInterval(generalTimer);
			}
			changePage();
		});
	});
});

//一级屏翻动计时器
let generalTimer: any;
//诊室页面翻动
const changePage = () => {
	if (screenData?.length > 5) {
		let pageSize = Math.ceil(screenData.length / 5);
		let generalTimer = setInterval(() => {
			currentPage.value == pageSize ? (currentPage.value = 1) : currentPage.value++;
		}, 15000);
	}
};
//跑马灯数据加载
const loadData = (tempQueue: Array<object>, screenData: any, dataName: string) => {
	let waitNum = -1;
	let tempList = [] as any;
	//六个一组进行翻页
	tempQueue.forEach((item: any, index: number) => {
		if (index % 6 === 0) {
			waitNum++;
			tempList[waitNum] = [];
		}
		tempList[waitNum].push(item.appointVisitno + "-" + formatName(item.patientName));
	});
	//element-plus bug
	if (tempList.length === 2) {
		tempList.push(...tempList);
	}
	screenData[dataName] = tempList;
};

//弹窗控制
const popover = () => {
	if (noticeList.length) {
		dialogVisible.value = true;
		showVisitInfo.appointVisitno = noticeList[0].appointVisitno;
		showVisitInfo.visitRoom = noticeList[0].realityConsultingroomName;
		showVisitInfo.patientName = noticeList[0].patientName;
		playSound("请" + showVisitInfo.appointVisitno + "号" + showVisitInfo.patientName + "到" + showVisitInfo.visitRoom + "就诊");
		let timer = setInterval(() => {
			noticeList.shift();
			popover();
			clearInterval(timer);
		}, 5000);
	} else {
		dialogVisible.value = false;
	}
};

//给消息弹窗队列添加数据
const addList = (data: any) => {
	if (noticeList.length) {
		noticeList.push(data);
	} else {
		noticeList.push(data);
		popover();
	}
};

//组件卸载关闭websocket连接并清除定时器
onBeforeUnmount(() => {
	websocketList?.value?.forEach((item: any) => {
		socket.closeWebSocket(item);
	});
	if (timer) {
		clearInterval(timer);
	}
	if (generalTimer) {
		clearInterval(generalTimer);
	}
});
</script>

<style lang="scss">
.general_screen {
	width: 100%;
	height: 100%;
	background: #002b69;
	.screen_header {
		height: 100px;
		background: #2396ca;
		border-radius: 0 0 20px 20px;
		position: relative;
		color: #fff;
		img {
			position: absolute;
			width: 78px;
			top: 10px;
			left: 18px;
		}
		.hospital_name {
			position: absolute;
			font-size: 48px;
			top: 24px;
			left: 108px;
		}
		.date {
			position: absolute;
			font-size: 32px;
			top: 20px;
			right: 120px;
		}
		.week {
			position: absolute;
			font-size: 32px;
			top: 20px;
			right: 20px;
		}
		.ip {
			font-size: 24px;
			color: #ffffff;
			position: absolute;
			top: 54px;
			right: 115px;
		}
		.time {
			font-size: 72px;
			position: absolute;
			right: 290px;
			top: 15px;
		}
	}
	.screen_main {
		height: calc(100% - 204px);
		background: #002b69;
		overflow: hidden;
		padding: 15px;
		.el-table {
			height: 100%;
			border-radius: 12px 12px 0 0;
			--el-table-border-color: #979797;
			--el-table-tr-bg-color: transparent;
			--el-table-header-bg-color: #0251c6;
			background: #144286;
			//走马灯
			.el-carousel {
				height: 100%;
				.el-carousel__container {
					height: 100%;
					line-height: 68px;
				}
				.el-carousel__indicators {
					display: none;
				}
			}
			.el-table__inner-wrapper::before {
				height: 0;
			}
			thead {
				color: #fff;
				.cell {
					text-align: center;
					letter-spacing: 5px;
				}
			}
			tbody {
				color: #fff;
				font-weight: 400;
				tr:hover > td.el-table__cell {
					background: transparent;
				}
				.cell {
					height: 138px;
					font-size: 35px;
					line-height: 138px;
					word-wrap: break-word;
					padding: 0 0 0 12px;
				}
			}
			.el-table__header .el-table__cell {
				height: 90px;
				font-size: 48px;
				padding: 5px;
				.cell {
					line-height: 90px;
				}
			}
		}
	}
	.screen_footer {
		width: calc(100% - 80px);
		height: 72px;
		background: #003179;
		border-radius: 20px 20px 0 0;
		line-height: 72px;
		padding: 0 40px;
		.marquee {
			white-space: nowrap;
			box-sizing: border-box;
			overflow: hidden;
			width: 100%;
			height: 100%;
			p {
				color: #fda825;
				font-size: 24px;
				display: inline-block;
				padding-left: 100%;
				animation: marquee 30s linear infinite;
			}
		}
		@keyframes marquee {
			from {
				transform: translateX(-100%);
			}
			to {
				transform: translateX(0%);
			}
		}
	}
	.el-dialog {
		width: 690px;
		height: 390px;
		background: #012b69;
		border-radius: 16px;
		display: flex;
		justify-content: center;
		align-items: center;
		--el-dialog-padding-primary: 0;
		text-align: center;
		p {
			font-size: 64px;
			font-weight: 500;
			color: #ffffff;
			line-height: 96px;
			letter-spacing: 8px;
			span {
				color: #5bc0f8;
				letter-spacing: 8px;
			}
		}
	}
}
</style>
