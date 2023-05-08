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
			<div class="hospitalName">
				<img src="/src/assets/images/logo/hospital_logo.png" alt="" />
				安康市中心医院
			</div>
			<div class="dateTime">
				<div class="time">{{ timeInfo }}</div>
				<div class="date_area">
					<div class="date">{{ dateInfo }}</div>
					<div class="week">{{ weekInfo }}</div>
				</div>
				<div class="ip">编号：{{ showIp }}</div>
			</div>
		</div>
		<div class="screen_main">
			<div class="department_list">
				<el-table :data="screenData" style="width: 100%">
					<el-table-column align="center" width="260" prop="physicinfoName" label="诊室">
						<template v-slot="scope">
							<span>{{ scope.row.consultingroomName }}</span>
						</template>
					</el-table-column>
					<el-table-column align="center" width="130" label="医生" prop="staffName"></el-table-column>
					<el-table-column align="center" label="就诊人" width="150">
						<template v-slot="scope">
							<span style="color: #fffa53">
								{{ scope.row.appointVisitno ? scope.row.appointVisitno + "-" + formatName(scope.row.patientName) : "" }}
							</span>
						</template>
					</el-table-column>
					<el-table-column ref="waitingCellRef" align="left" label="等待队列">
						<template v-slot="scope">
							<div
								:ref="setItemRef"
								:style="{
									animation:
										itemRefsWidth[scope.$index] > waitingCellWidth
											? `scrollList ${(itemRefsWidth[scope.$index] + waitingCellWidth) / 70}s linear infinite`
											: '',
								}"
								class="scrollList"
							>
								<span class="waiting-list" v-for="(item, index) in scope.row.waitingQueue">
									{{
										item.appointVisitno +
										"-" +
										formatName(item.patientName) +
										(index === scope.row.waitingQueue.length - 1 ? "" : "、  ")
									}}
								</span>
							</div>
						</template>
					</el-table-column>
					<el-table-column align="left" label="过号队列" width="360">
						<template v-slot="scope">
							<div
								:ref="setOverItemRef"
								:style="{
									animation:
										overItemRefsWidth[scope.$index] > 350
											? `scrollList ${(overItemRefsWidth[scope.$index] + 350) / 40}s linear infinite`
											: '',
								}"
								class="scrollList"
							>
								<span class="over-list" v-for="(item, index) in scope.row.overNumQueue">
									{{
										item.appointVisitno +
										"-" +
										formatName(item.patientName) +
										(index === scope.row.overNumQueue.length - 1 ? "" : "、  ")
									}}
								</span>
							</div>
						</template>
					</el-table-column>
				</el-table>
			</div>
		</div>
		<div class="screen_footer">
			<div class="marquee">
				<p>温馨提示，请保持安静有序排队!</p>
			</div>
		</div>
		<el-dialog v-model="dialogVisible" width="30%" align-center :show-close="false" :close-on-click-modal="false">
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
//日期
let dateInfo = ref();
//星期
let weekInfo = ref();
let week = ["日", "一", "二", "三", "四", "五", "六"];
//时间
let timeInfo = ref();
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

let waitingCellRef = ref(); //每行cell的实例
let waitingCellWidth = ref(); //每行cell的宽度
let itemRefs: any = ref([]); //等待队列内容div实例
let itemRefsWidth = ref<number[]>([]); //等待队列cell的内容宽度数组
let overItemRefs: any = ref([]); //过号队列内容div实例
let overItemRefsWidth = ref<number[]>([]); //过号队列cell的内容宽度数组
const setItemRef = (el: any) => {
	itemRefs.value.push(el);
};
const setOverItemRef = (el: any) => {
	overItemRefs.value.push(el);
};

onUpdated(() => {
	let itemRef = itemRefs.value.splice(-8); //取最后诊室数XX位
	let overItemRef = overItemRefs.value.splice(-8); //取最后诊室数XX位
	itemRefsWidth.value = [];
	overItemRefsWidth.value = [];
	itemRef.forEach((item: any) => {
		itemRefsWidth.value.push(item.offsetWidth);
	});
	overItemRef.forEach((item: any) => {
		overItemRefsWidth.value.push(item.offsetWidth);
	});
});

onMounted(() => {
	//获取并截取ip
	let ip = window.location.hostname;
	let index = ip.indexOf(".", ip.indexOf(".") + 1);
	showIp.value = ip.substring(index + 1);
	//开启时间显示定时器
	timer = setInterval(() => {
		let date: Date = new Date();
		let _week = Number(dayjs(date).format("d"));
		weekInfo.value = "星期" + week[_week];
		dateInfo.value = dayjs(date).format("YYYY.MM.DD");
		timeInfo.value = dayjs(date).format("HH:mm");
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
		proxy.$axios.get(`/hospital/selectByIp?ip=${ip}`).then((res: any) => {
			//proxy.$axios.get(`/hospital/selectByIp?ip=192.168.15.255`).then((res: any) => {
			let tempData = res.data.data;
			//给等待队列宽度赋值
			waitingCellWidth.value = waitingCellRef.value.$.columnConfig.value.realWidth - 10;
			//指定诊室数量长度的数组
			itemRefs.value = new Array(tempData.length).fill(0);
			overItemRefs.value = new Array(tempData.length).fill(0);
			tempData?.forEach((item: any, index: number) => {
				if (item?.consultingroomId) {
					screenData[index] = { ...tempData[index], waitingQueue: [], overNumQueue: [] };
					let websocket = socket.createWebSocket(`${WS_URL}/websocket/${item?.consultingroomId}/1`, (message: any) => {
						//let websocket = socket.createWebSocket(`ws://192.168.1.204:6480/websocket/${item?.consultingroomId}/1`, (message: any) => {
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
							addList(JSON.parse(message.data).visitPatients[0]);
						}
						screenData[index].waitingQueue = officeQueue.waitingQueue;
						screenData[index].overNumQueue = officeQueue.overNumQueue;
						if (officeQueue.visitPatients.length) {
							officeQueue.visitPatients.forEach((patientItem: any) => {
								patientItem.realityConsultingroomId === patientItem.consultingroomId
									? (screenData[index].patientName = patientItem.patientName)
									: "";
								patientItem.realityConsultingroomId === patientItem.consultingroomId
									? (screenData[index].appointVisitno = patientItem.appointVisitno)
									: "";
							});
						} else {
							screenData[index].patientName = "";
							screenData[index].appointVisitno = "";
						}
					});
					websocketList.value.push(websocket);
				}
			});
		});
	});
});

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
	websocketList?.forEach((item: any) => {
		socket.closeWebSocket(item);
	});
	if (timer) {
		clearInterval(timer);
	}
});
</script>

<style lang="scss">
.general_screen {
	width: 100%;
	height: 100%;
	background: #003e98;
	.screen_header {
		height: 80px;
		background: #2396ca;
		border-radius: 0 0 20px 20px;
		display: flex;
		justify-content: space-between;
		.hospitalName {
			font-size: 32px;
			font-weight: 500;
			color: #ffffff;
			padding-left: 30px;
			line-height: 80px;
			img {
				width: 60px;
				margin-right: 10px;
			}
		}
		.dateTime {
			color: #ffffff;
			font-weight: 400;
			font-size: 20px;
			text-align: right;
			height: 80px;
			display: flex;
			.date_area {
				display: flex;
				font-size: 20px;
				position: absolute;
				top: 18px;
				right: 20px;
				.date {
					margin-right: 4px;
				}
			}
			.ip {
				font-size: 20px;
				font-weight: 400;
				color: #ffffff;
				position: absolute;
				top: 42px;
				right: 50px;
			}
			.time {
				font-size: 48px;
				width: 120px;
				position: absolute;
				right: 189px;
				top: 20px;
			}
		}
	}
	.screen_main {
		height: calc(100% - 136px);
		overflow: hidden;
		.department_list {
			height: 94%;
			width: calc(100% - 36px);
			margin: 18px;
			.el-table {
				height: 100%;
				border-radius: 12px;
				--el-table-border-color: #979797;
				--el-table-tr-bg-color: transparent;
				--el-table-header-bg-color: #0251c6;
				background: #144286;
				.scrollList {
					white-space: nowrap;
					overflow: hidden;
					height: 100%;
					display: inline-block;
					span {
						letter-spacing: 4px;
						word-spacing: 3px;
						display: inline-block;
					}
				}
				@keyframes scrollList {
					from {
						transform: translateX(100%);
					}
					to {
						transform: translateX(-100%);
					}
				}
				thead {
					color: #ffffff;
				}
				tbody {
					color: #fff;
					font-weight: 400;
					tr:hover > td.el-table__cell {
						background: transparent;
					}
				}
				.el-table__cell {
					height: 70px;
					font-size: 24px;
					line-height: 40px;
					padding: 5px;
				}
			}
		}
	}
	.screen_footer {
		width: calc(100% - 80px);
		height: 56px;
		background: rgba(0, 0, 0, 0.2);
		border-radius: 20px 20px 0 0;
		line-height: 56px;
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
