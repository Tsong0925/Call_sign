<!--
* @FileDescription: 护士操作界面-诊区
* @router: nurseDepartment
* @Author: 王欣
* @Date: 2023-03-13
* @LastEditors: 王欣
* @LastEditTime：2023-03-21
-->
<template>
	<div id="nurse_department">
		<el-container>
			<el-header>
				<el-row>
					<el-col :span="16" class="hospital_name">
						<span style="margin-right: 30px">安康市中心医院</span>
						<el-button class="page_jump button_active" @click="router.push('/nurseDepartment')">挂号信息</el-button>
						<el-button class="page_jump" @click="router.push('/nurseConsult')">诊室信息</el-button>
					</el-col>
					<el-col :span="8" class="nurse_name">
						<el-button class="exit-button" @click="exit">退出</el-button>
						<span style="float: right">{{ "欢迎您，" + userInfo.staffName + "护士！" }}</span>
					</el-col>
				</el-row>
			</el-header>
			<el-main class="main_container">
				<el-row :gutter="20" class="search_list">
					<el-col :span="24">
						<el-select
							v-model="selectDiagnostic"
							placeholder="请选择诊区"
							size="large"
							style="margin-right: 12px"
							@change="diagnosticChange"
						>
							<el-option v-for="item in areaList" :key="item.areaId" :label="item.areaName" :value="item.areaId" />
						</el-select>
						<el-select
							v-model="selectConsult"
							placeholder="所有诊室"
							size="large"
							style="margin-right: 12px"
							clearable
							@change="tabChange"
						>
							<el-option
								v-for="item in consultList"
								:key="item.consultingroomId"
								:label="item.consultingroomName"
								:value="item.consultingroomId"
							/>
						</el-select>
						<anti-shake-button
							recallBtn="顺呼"
							color="#0081C9"
							size="large"
							class="operate"
							@click="nextPatient"
							v-show="selectConsult && !hasPatient"
						></anti-shake-button>
						<anti-shake-button
							recallBtn="重呼"
							color="#0081C9"
							size="large"
							class="operate"
							@click="reCall"
							v-show="selectConsult && hasPatient"
						></anti-shake-button>
						<el-button
							color="#DB6565"
							size="large"
							class="operate"
							style="color: #fff"
							@click="overNumbered"
							v-show="selectConsult"
							:disabled="!hasPatient"
						>
							过号
						</el-button>
					</el-col>
					<!-- <el-col :span="9">
						<el-input size="large" v-model="inputValue" placeholder="请输入序号或姓名搜索" style="width: 240px" />
						<el-button color="#0081C9" size="large" style="border-radius: 0 4px 4px 0; font-size: 20px" @click="searchPatient">
							搜索
						</el-button>
					</el-col> -->
				</el-row>
				<el-row class="table_list">
					<el-col :span="22" style="height: 100%">
						<el-table :data="tableData" height="100%" stripe style="width: 100%">
							<el-table-column type="index" label="序号" align="center" width="80" />
							<el-table-column prop="officeName" label="科室" align="center" />
							<el-table-column prop="realityConsultingroomName" label="诊室" align="center" />
							<el-table-column prop="appointVisitno" label="队列序号" align="center" />
							<el-table-column prop="reginfoId" label="挂号ID" align="center" />
							<el-table-column prop="patientName" label="患者姓名" align="center" />
							<el-table-column label="操作区域" align="center" v-if="selectValue === 'overNumber'">
								<template #default="{ row }">
									<el-popconfirm
										confirm-button-text="确认"
										cancel-button-text="取消"
										icon-color="#626AEF"
										title="确认将此患者重新加入队列吗?"
										@confirm="againPutQueue(row)"
									>
										<template #reference>
											<el-button link type="primary" style="color: #0081c9">重新加入队列</el-button>
										</template>
									</el-popconfirm>
								</template>
							</el-table-column>
						</el-table>
					</el-col>
					<el-col :span="2" style="">
						<el-tabs v-model="selectValue" type="card" tab-position="left" @tab-change="tabChange">
							<el-tab-pane :label="'未过号\n(' + notAllowedPeople + ')'" name="notAllowed"></el-tab-pane>
							<el-tab-pane :label="'过号\n(' + overNumberPeople + ')'" name="overNumber"></el-tab-pane>
							<el-tab-pane :label="'诊结\n(' + finishedPeople + ')'" name="finished"></el-tab-pane>
						</el-tabs>
					</el-col>
				</el-row>
			</el-main>
		</el-container>
	</div>
</template>

<script setup lang="ts">
import { socket } from "@/utils/websocket";
import AntiShakeButton from "@/components/AntiShakeButton.vue";
import { ElMessage } from "element-plus";
import { reloadPage,WS_URL } from "../../utils/util";

//获取代理
const { proxy } = getCurrentInstance() as any;

//挂号人数
let notAllowedPeople = ref(0);
//过号人数
let overNumberPeople = ref(0);
//诊结人数
let finishedPeople = ref(0);

//选中选项卡,默认为未过号列表
let selectValue: string = "notAllowed";

//列表数据
let tableData = ref<Array<any>>([]);
//切换列表
const tabChange = () => {
	if (selectValue === "notAllowed") {
		if (selectConsult.value) {
			decideData("waitingQueue");
		} else {
			tableData.value = waitingQueue.value;
			notAllowedPeople.value = waitingQueue?.value.length;
			overNumberPeople.value = overNumQueue?.value.length;
			finishedPeople.value = finishQueue?.value.length;
		}
	} else if (selectValue === "overNumber") {
		if (selectConsult.value) {
			decideData("overNumQueue");
		} else {
			tableData.value = overNumQueue.value;
			notAllowedPeople.value = waitingQueue?.value.length;
			overNumberPeople.value = overNumQueue?.value.length;
			finishedPeople.value = finishQueue?.value.length;
		}
	} else if (selectValue === "finished") {
		if (selectConsult.value) {
			decideData("finishQueue");
		} else {
			tableData.value = finishQueue.value;
			notAllowedPeople.value = waitingQueue?.value.length;
			overNumberPeople.value = overNumQueue?.value.length;
			finishedPeople.value = finishQueue?.value.length;
		}
	}
	//判断是否存在当前就诊人
	if (!visitQueue.value.length) {
		hasPatient.value = false;
	}
	for (let i = 0; i < visitQueue.value.length; i++) {
		console.log(visitQueue.value[i].realityConsultingroomId);
		console.log(selectConsult.value);
		if (visitQueue.value[i].realityConsultingroomId == selectConsult.value) {
			hasPatient.value = true;
			return;
		}
		hasPatient.value = false;
	}
};

//筛选数据
const decideData = (name: string) => {
	queueList.forEach((item: any) => {
		if (item.id == selectConsult.value) {
			//@ts-ignore
			tableData.value = item[name];
			notAllowedPeople.value = item.waitingQueue.length;
			overNumberPeople.value = item.overNumQueue.length;
			finishedPeople.value = item.finishQueue.length;
		}
	});
};

//总候诊队列
let waitingQueue = ref<Array<any>>([]);
//总过号队列
let overNumQueue = ref<Array<any>>([]);
//总诊结队列
let finishQueue = ref<Array<any>>([]);
//总就诊队列
let visitQueue = ref<Array<any>>([]);

//存在当前就诊人
let hasPatient = ref<boolean>(false);

watch(
	() => [...visitQueue.value],
	(newValue, oldValue) => {
		if (!newValue.length) {
			hasPatient.value = false;
		}
		for (let i = 0; i < newValue.length; i++) {
			console.log(visitQueue.value[i].realityConsultingroomId);
			console.log(selectConsult.value);
			if (newValue[i].realityConsultingroomId == selectConsult.value) {
				hasPatient.value = true;
				return;
			}
			hasPatient.value = false;
		}
		console.log(hasPatient.value);
	},
	{ deep: true }
);

//从websocket中接收队列数据
let queueList = <any>[];

//websocket接收数组
let websocketList = <any>[];

//建立socket连接
const handleSocket = () => {
	queueList = [];
	//判断普通号只添加一次队列,是否第二次添加普通队列
	let flag = false;
	if (!consultList.value?.length) {
		tableData.value.length = 0;
	}
	consultList?.value?.forEach((item, index) => {
		//判断普通号只添加一次队列
		if (!flag) {
			if (item.consultingroomType === "01") {
				flag = true;
			}
			queueList.push({
				id: item.consultingroomId,
				name: item.consultingroomName,
			});
			let websocket = socket.createWebSocket(`${WS_URL}/websocket/${item.consultingroomId}/4`, (message: any) => {
				//websocket重新获取更新后数据，并将其放至于总队列中（根据诊室划分）
				let tempData = JSON.parse(message.data);
				//判断是否刷新页面
				reloadPage(tempData);
				queueList[index].waitingQueue = tempData?.waitingQueue;
				queueList[index].overNumQueue = tempData?.overNumQueue;
				queueList[index].finishQueue = tempData?.finishQueue;
				queueList[index].visitPatients = tempData?.visitPatients;

				//将全部队列置空
				waitingQueue.value = [];
				overNumQueue.value = [];
				finishQueue.value = [];
				visitQueue.value = [];

				queueList.forEach((item: any) => {
					item.waitingQueue ? waitingQueue.value.push(...item.waitingQueue) : "";
					item.overNumQueue ? overNumQueue.value.push(...item.overNumQueue) : "";
					item.finishQueue ? finishQueue.value.push(...item.finishQueue) : "";
					item.visitPatients ? visitQueue.value.push(...item.visitPatients) : "";
				});

				tabChange();
			});
			websocketList.push(websocket);
		}
	});
};

//诊区和诊室数据
let areaList = ref<Array<any>>([]);
//选中的诊室
let selectConsult = ref("");
//选中的诊区
let selectDiagnostic = ref("");
//诊室列表
let consultList = ref<Array<any>>([]);
//用户信息
let userInfo = ref<any>({});
//列表数据
onMounted(() => {
	userInfo.value = JSON.parse(localStorage.getItem("userInfo") as any);
	proxy.$axios.get(`/hospital/selectByStaffId?staffId=${userInfo.value?.staffId}`).then((res: any) => {
		areaList.value = res?.data?.data;
		selectDiagnostic.value = areaList?.value ? areaList?.value[0]?.areaId : "";
		consultList.value = areaList?.value ? areaList?.value[0]?.consultingrooms : "";
		//初始化socket连接
		handleSocket();
	});
});

//切换诊区后显示诊室
const diagnosticChange = () => {
	selectConsult.value = "";
	areaList.value.forEach((item) => {
		if (selectDiagnostic.value === item.areaId) {
			consultList.value = item.consultingrooms;
		}
	});
	websocketList?.forEach((item: any) => {
		socket.closeWebSocket(item);
	});
	//重新建立连接
	handleSocket();
};

//顺呼
const nextPatient = () => {
	let hasVisit = false;
	visitQueue.value.forEach((item) => {
		if (item.realityConsultingroomId == selectConsult.value) {
			hasVisit = true;
			ElMessage("当前诊室存在就诊人，就结诊后再呼叫！");
			return;
		}
	});
	if (!hasVisit) {
		let tempRegInfoId = tableData.value[0].reginfoId;
		proxy.$axios.get(`/call/asc?consultingroomId=${selectConsult.value}&nextRegInfoId=${tempRegInfoId}`).then((res: any) => {
			if (res?.data?.status === "fail") {
				ElMessage(res?.data?.data);
			} else {
				ElMessage({ type: "success", message: "呼叫成功" });
			}
		});
	}
};

//重呼
const reCall = () => {
	let nextRegInfoId = "";
	visitQueue.value.forEach((item) => {
		if (item.realityConsultingroomId == selectConsult.value) {
			nextRegInfoId = item.reginfoId;
		}
	});
	proxy.$axios.get(`/call/again?consultingroomId=${selectConsult.value}&regInfoId=${nextRegInfoId}`).then((res: any) => {
		if (res?.data?.status === "fail") {
			ElMessage(res?.data?.data);
		} else {
			ElMessage({ type: "success", message: "呼叫成功" });
		}
	});
};

//过号
const overNumbered = () => {
	let hasVisit = false;
	let nextRegInfoId = "";
	visitQueue.value.forEach((item) => {
		if (item.realityConsultingroomId == selectConsult.value) {
			nextRegInfoId = item.reginfoId;
			hasVisit = true;
		}
	});
	if (hasVisit) {
		proxy.$axios.get(`/call/overNum?consultingroomId=${selectConsult.value}&regInfoId=${nextRegInfoId}`).then((res: any) => {
			if (res?.data?.status === "fail") {
				ElMessage(res?.data?.data);
			} else {
				ElMessage({ type: "success", message: "过号成功！" });
			}
		});
	} else {
		ElMessage("当前诊室无就诊人！");
	}
};
//使用路由
const router = useRouter();
//退出登录
const exit = () => {
	//清除登录信息，并跳转回登录界面
	proxy.$axios.post("/logout", { staffId: userInfo.value?.staffId }).then((res: any) => {
		ElMessage({
			type: "success",
			message: "退出成功！",
		});
		localStorage.removeItem("userInfo");
		router.push("/");
	});
};

//重新加入队列
const againPutQueue = (row: any) => {
	proxy.$axios.post(`/sesanconnector/base/againPutQueue?reginfoId=${row.reginfoId}&queueStats=${row.appointStatus}`).then((res: any) => {
		if (res?.data?.data && res.data.status == "ok") {
			ElMessage({ type: "success", message: "加入成功！" });
		} else {
			ElMessage({ type: "warning", message: "加入失败！" });
		}
	});
};

onBeforeUnmount(() => {
	websocketList?.forEach((item: any) => {
		socket.closeWebSocket(item);
	});
});
</script>

<style lang="scss">
#nurse_department {
	height: calc(100% - 40px);
	width: calc(100% - 60px);
	padding: 20px 30px 20px 30px;
	background: #274b99;
	background: linear-gradient(#fbf1f1, #fcdee6);
	.el-container {
		height: 100%;
		.el-header {
			line-height: var(--el-header-height);
			margin-bottom: 10px;
			color: #fd6552;
			.hospital_name {
				font-size: 32px;
				.page_jump {
					margin-left: 30px;
					background: #fff;
					box-shadow: 1px 3px 0 0 #274b99;
					border-radius: 27px;
					border: 1px solid #ffffff;
					color: #8d8d8d;
					font-size: 24px;
				}
				.button_active {
					background: #0181c9;
					color: #fff;
				}
			}
			.nurse_name {
				font-size: 20px;
				.exit-button {
					color: #0486fe;
					font-size: 20px;
					float: right;
					line-height: 40px;
					margin-top: 14px;
				}
			}
		}
		.main_container {
			background: #fff;
			border-radius: 56px 56px 12px 12px;
			padding: 30px;
			box-shadow: inset 0 0 5px 4px #b2d5ff;
			overflow: hidden;
			.search_list {
				height: 50px;
				line-height: 50px;
				margin-bottom: 20px;
				.el-input__wrapper {
					border-radius: 4px 0 0 4px;
					border-right: none;
				}
				.operate {
					width: 104px;
					font-size: 20px;
				}
			}
			.table_list {
				height: calc(100% - 70px);
				.el-table {
					font-size: 22px;
					th.el-table__cell {
						background: #eff6ff;
						height: 56px;
						color: #323233;
					}
					.el-table__cell {
						padding: 16px 0;
					}
				}
				.el-tabs__header {
					margin-left: 0px;
					border-bottom: none;
					.el-tabs__nav {
						border: none;
						.el-tabs__item {
							height: 104px;
							width: 75px;
							background: #fbf1f1;
							color: #323233;
							font-size: 20px;
							padding: 12px 0 0 0;
							text-align: center;
							white-space: pre-line;
							&:first-child {
								border-top-right-radius: 12px;
							}
							&:last-child {
								border-bottom-right-radius: 12px;
							}
							&.is-active {
								width: 90px;
								background: #0081c9;
								box-shadow: inset 0 0 8px 0 #274b99;
								color: #fff;
							}
						}
					}
				}
			}
		}
	}
}
</style>
