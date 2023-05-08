<!--
* @FileDescription: 二级屏展示页面
* @router: secondaryScreen
* @Author: 王欣
* @Date: 2023-03-15
* @LastEditors: 王欣
* @LastEditTime：2023-04-17
-->
<template>
	<div class="horizontal_secondary">
		<el-container>
			<el-header>
				<el-row>
					<el-col :span="12">
						<img class="img_logo" src="@/assets/images/logo/hospital_logo.png" alt="" />
						<div class="hospital_name">{{ "安康市中心医院" }}</div>
						<div class="department_name">{{ departmentName }}</div>
					</el-col>
					<el-col :span="12">
						<div class="time_header">
							<div class="time">{{ time.timeInfo }}</div>
							<div class="date">{{ time.dateInfo }}</div>
							<div class="week">{{ time.weekInfo }}</div>
							<div class="ip">编号：{{ showIp }}</div>
						</div>
					</el-col>
				</el-row>
			</el-header>
			<el-main>
				<div class="main_container">
					<el-row style="height: 25%" class="main_header">
						<el-col :span="18">
							<div class="doctor_name">{{ staffName }}</div>
							<div class="doctor_describe">
								{{ staffIntroduce }}
							</div>
						</el-col>
						<el-col :span="6" style="width: 100%; height: 100%">
							<img class="img_container" :src="staffPhoto" alt="" />
						</el-col>
					</el-row>
					<el-row style="height: 15%" class="current_person_container">
						<el-col :span="24" class="current_person">
							<span style="font-size: 26px">当前就诊人：</span>
							<span style="font-size: 36px; margin-right: 20px">
								{{
									currentVisitor?.data?.appointVisitno
										? currentVisitor?.data?.appointVisitno + "-" + formatName(currentVisitor?.data?.patientName)
										: ""
								}}
							</span>
						</el-col>
					</el-row>
					<el-row style="height: 12%; text-align: center">
						<el-col :span="24">
							<div style="font-size: 26px; margin-bottom: 10px">下一候诊人</div>
							<div style="color: #003e98; font-size: 36px">
								<span style="margin-right: 15px">
									{{
										nextVisitor?.data?.appointVisitno
											? nextVisitor?.data?.appointVisitno + "-" + formatName(nextVisitor?.data?.patientName)
											: ""
									}}
								</span>
							</div>
						</el-col>
					</el-row>
					<el-row style="height: 34%; padding: 0 20px">
						<el-col :span="24">
							<img class="title_img" src="../../assets/images/waiting.png" alt="" />
							<span class="title">请以下人员耐心等待</span>
							<div class="list_container">
								<div class="waiting_item" v-for="item in 4" :key="item">
									<span class="name">{{ waitingQueue[item - 1]?.appointVisitno }}</span>
									<span class="name">{{ formatName(waitingQueue[item - 1]?.patientName) }}</span>
								</div>
							</div>
						</el-col>
					</el-row>
					<el-row style="height: 14%; padding: 10px 20px; border-radius: 0 0 12px 12px">
						<el-col :span="24">
							<img class="title_img" src="../../assets/images/overNumber.png" alt="" />
							<span class="title">过号队列</span>
							<div class="list_container">
								{{
									overNumQueue[0]?.appointVisitno +
									"-" +
									formatName(overNumQueue[0]?.patientName) +
									(overNumQueue[1]
										? "、 " + overNumQueue[1]?.appointVisitno + "-" + formatName(overNumQueue[1]?.patientName)
										: "")
								}}
							</div>
						</el-col>
					</el-row>
				</div>
			</el-main>
			<el-footer>
				<el-row>
					<el-col :span="24">温馨提示：请保持安静！</el-col>
				</el-row>
			</el-footer>
		</el-container>
	</div>
</template>

<script setup lang="ts">
import { formatName, reloadPage, WS_URL } from "@/utils/util";
import { socket } from "@/utils/websocket";
import dayjs from "dayjs";
import { findLanguageType, playSound } from "@/utils/sound";
import { ElMessage } from "element-plus";

interface queueObject {
	appointVisitno: string;
	patientName: string;
}

//获取代理
const { proxy } = getCurrentInstance() as any;
let currentVisitor = reactive<any>({ data: {} }); //当前就诊人

//监听是否叫号或者重呼，用来判断语音提示
watch(
	() => [currentVisitor.data.patientId, currentVisitor.data.recallTimes],
	(newValue) => {
		if (newValue[0]) {
			playSound(
				"请" + currentVisitor.data.appointVisitno + "号" + currentVisitor.data.patientName + "到" + departmentName.value + "就诊"
			);
		}
	}
);
let nextVisitor = reactive<any>({ data: {} }); //下一候诊人s
let waitingQueue = ref<Array<queueObject>>([]); //等待队列
let overNumQueue = ref<Array<queueObject>>([]); //过号队列

let departmentName = ref<string>(""); //诊室名
//处理websocket返回数据
const receiveMessage = (message: any) => {
	let tempData = JSON.parse(message.data);
	console.log(tempData);
	//判断是否刷新页面
	reloadPage(tempData);
	let nextFirstFlag = true; //当第一个queueStats为01的患者取出为 下一候诊人
	waitingQueue.value = [];
	overNumQueue.value = [];
	if (!tempData?.waitingQueue?.length) {
		nextVisitor.data = {};
		waitingQueue.value = [];
	}
	//放置候诊队列
	tempData?.waitingQueue?.forEach((item: any, index: number) => {
		if (item?.queueStats === "01") {
			nextFirstFlag ? (nextVisitor.data = item) : waitingQueue.value.push(item);
			nextFirstFlag = false;
		}
	});

	if (!tempData?.visitPatients?.length) {
		currentVisitor.data = {};
	}
	tempData?.visitPatients?.forEach((item: any, index: number) => {
		if (item?.realityConsultingroomId === consultingroomId.value) {
			if (!currentVisitor.data.patientId || currentVisitor.data.patientId !== item.patientId) {
			}
			currentVisitor.data = item;
		}
	});
	tempData?.overNumQueue?.forEach((item: queueObject) => {
		overNumQueue.value.push(item);
	});
};
//时间
let time = reactive({
	dateInfo: "", //日期
	weekInfo: "", //星期
	week: ["日", "一", "二", "三", "四", "五", "六"],
	timeInfo: "", //时间
});
let timer: any;

let websocket = null as any;

let staffIntroduce = ref<string>(""); //医生介绍
let staffName = ref<string>(""); //医生姓名
let consultingroomId = ref<string>(""); //诊室ID
let staffPhoto = ref<string>(""); //照片路径
let showIp = ref<string>();

onMounted(() => {
	// 等待触发voiceschanged事件才能正常获取语音列表，否则获取不到任何值（可能是chrome独有问题）
	window.speechSynthesis.addEventListener("voiceschanged", (event) => {
		findLanguageType();
	});
	proxy.$axios.get(`/getIp`).then((res: any) => {
		let ip = res.data.data;
		//获取并截取ip
		let index = ip.indexOf(".", ip.indexOf(".") + 1);
		showIp.value = ip.substring(index + 1);
		proxy.$axios.get(`/hospital/selectTwoByIp?ip=${ip}`).then((res: any) => {
			// proxy.$axios.get(`/hospital/selectTwoByIp?ip=192.168.15.250`).then((res: any) => {
			departmentName.value = res?.data?.data?.consultingroomName;
			staffIntroduce.value = res?.data?.data?.staffIntroduce;
			staffName.value = res?.data?.data?.staffName;
			consultingroomId.value = res?.data?.data?.consultingroomId;
			staffPhoto.value = res?.data?.data?.staffPhoto;
			if (consultingroomId.value) {
				websocket = socket.createWebSocket(`${WS_URL}/websocket/${consultingroomId.value}/2`, receiveMessage);
			} else {
				ElMessage({
					type: "warning",
					message: "未查询到诊室，该设备不在已知设备列表内，请在管理端添加该设备信息。",
					duration: 0,
				});
			}
		});
	});

	timer = setInterval(() => {
		let date: Date = new Date();
		let _week = Number(dayjs(date).format("d"));
		time.weekInfo = "星期" + time.week[_week];
		time.dateInfo = dayjs(date).format("YYYY.MM.DD");
		time.timeInfo = dayjs(date).format("HH:mm");
	}, 1000);
});

onBeforeUnmount(() => {
	socket.closeWebSocket(websocket);
	if (timer) {
		clearInterval(timer);
	}
});
</script>

<style lang="scss">
//横屏暂且为竖屏拉伸版，后期需要开发横屏版，直接修改竖屏样式
.horizontal_secondary,
.vertical_secondary {
	width: 100%;
	height: 100%;
	.el-container {
		height: 100%;
		.el-header {
			background: linear-gradient(to right, #1482ff, #1654ac);
			height: 70px;
			color: #fff;
			position: relative;
			.img_logo {
				width: 46px;
				height: 46px;
				position: absolute;
				top: 12px;
			}
			.hospital_name {
				font-size: 22px;
				position: absolute;
				left: 52px;
				top: 12px;
			}
			.department_name {
				font-size: 16px;
				line-height: 70px;
				position: absolute;
				left: 52px;
				top: 13px;
			}
			.time_header {
				font-size: 16px;
				position: relative;
				.week {
					position: absolute;
					right: 0px;
					top: 16px;
				}
				.date {
					position: absolute;
					right: 52px;
					top: 16px;
				}
				.time {
					font-size: 42px;
					position: absolute;
					right: 140px;
					top: 16px;
				}
				.ip {
					opacity: 0.8;
					position: absolute;
					right: 52px;
					top: 38px;
				}
			}
		}
		.el-main {
			background: #003e98;
			padding: 12px;
			.main_container {
				background: #dcebff;
				width: 100%;
				height: 100%;
				border-radius: 12px;
				.title {
					color: #323233;
					font-size: 24px;
					vertical-align: middle;
					font-weight: 600;
				}
				.title_img {
					height: 24px;
					width: 24px;
					margin-right: 5px;
				}
				.list_container {
					padding: 10px 0px 0;
                    font-size: 28px;
                    text-align: center;
					.waiting_item {
						height: 50px;
						line-height: 50px;
						&:nth-child(2n-1) {
							background: rgba(0, 62, 152, 0.1);
						}
						&:nth-child(2n) {
							background: rgba(0, 62, 152, 0.05);
						}
						.name {
							display: inline-block;
							width: 50%;
							
						}
					}
				}
				.main_header {
					background: #c7e5ff;
					border-radius: 12px;
					padding: 20px 20px 10px 20px;
					.doctor_name {
						color: #003e98;
						font-size: 28px;
						margin-bottom: 10px;
						font-weight: 600;
					}
					.doctor_describe {
						color: #323233;
						font-size: 20px;
						letter-spacing: 1px;
						line-height: 25px;
						margin-right: 5px;
						word-wrap: break-word;
					}
					.img_container {
						width: 100%;
						height: 100%;
						max-width: 280px;
						max-height: 320px;
					}
				}
				.current_person_container {
					padding: 5px 50px 5px 50px;
					min-height: 100px;
					align-items: center;
					justify-content: center;
					.current_person {
						width: 100%;
						height: 75px;
						background: #003e98;
						border-radius: 12px;
						line-height: 70px;
						color: #fffa53;
						text-align: center;
					}
				}
			}
		}
		.el-footer {
			background: linear-gradient(to right, #1482ff, #1654ac);
			color: #fff;
			height: 56px;
			line-height: 56px;
			text-align: center;
			font-size: 18px;
		}
	}
}
</style>
