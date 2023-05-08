<!--
* @FileDescription: 护士操作界面-诊室
* @router: nurseConsult
* @Author: 王欣
* @Date: 2023-03-13
* @LastEditors: 王欣
* @LastEditTime：2023-03-15
-->
<template>
	<div id="nurse_consult">
		<el-container>
			<el-header>
				<el-row>
					<el-col :span="16" class="hospital_name">
						<span style="margin-right: 30px">安康市中心医院</span>
						<el-button class="page_jump" @click="router.push('/nurseDepartment')">挂号信息</el-button>
						<el-button class="page_jump button_active" @click="router.push('/nurseConsult')">诊室信息</el-button>
					</el-col>
					<el-col :span="8" class="nurse_name">
						<el-button class="exit-button" @click="exit">退出</el-button>
						<span style="float: right">{{ "欢迎您，" + userInfo.staffName + "护士！" }}</span>
					</el-col>
				</el-row>
			</el-header>
			<el-main class="main_container">
				<el-table :data="consultingList" height="100%" stripe style="width: 100%">
					<el-table-column type="index" label="序号" width="80" />
					<el-table-column prop="areaName" label="诊区" />
					<el-table-column prop="officeName" label="科室" />
					<el-table-column prop="consultingroomName" label="诊室" />
					<el-table-column prop="address" label="就诊人">
						<template #default="scope">
							<span>{{ scope.row.patientName }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="address" label="候诊队列">
						<template #default="scope">
							<span v-for="item in scope.row.waitingQueue">{{ item.patientName + "、" }}</span>
						</template>
					</el-table-column>
					<el-table-column prop="address" label="诊室状态">
						<template #default>
							<span>开诊中</span>
						</template>
					</el-table-column>
					<el-table-column prop="address" label="操作区域">
						<template #default>
							<!-- <el-button link type="primary" size="small">开诊</el-button> -->
							<!-- <el-button link type="primary" size="small">停诊</el-button> -->
						</template>
					</el-table-column>
				</el-table>
			</el-main>
		</el-container>
	</div>
</template>

<script setup lang="ts">
import { socket } from "../../utils/websocket";
import type { TableColumnCtx } from "element-plus";
import { ElMessage } from "element-plus";
import { reloadPage,WS_URL } from "../../utils/util";

interface User {
	id: string;
	name: string;
	amount1: string;
	amount2: string;
	amount3: number;
}

//获取代理
const { proxy } = getCurrentInstance() as any;
const router = useRouter(); //使用路由

//诊室数据
let consultingList = ref<Array<any>>([]);
interface SpanMethodProps {
	row: User;
	column: TableColumnCtx<User>;
	rowIndex: number;
	columnIndex: number;
}

//websocket数组
let websocketList = <Array<any>>[];
//用户信息
let userInfo = ref<any>({});
//列表数据
onMounted(() => {
	userInfo.value = JSON.parse(localStorage.getItem("userInfo") as any);
	proxy.$axios.get(`/hospital/selectByStaffId?staffId=${userInfo.value?.staffId}`).then((res: any) => {
		let tempData = res?.data?.data;
		tempData?.forEach((item: any, index: number) => {
			item?.consultingrooms?.forEach((subItem: any, subIndex: number) => {
				consultingList.value.push({
					areaId: item.areaId,
					areaName: item.areaName,
					consultingroomId: subItem.consultingroomId,
					consultingroomName: subItem.consultingroomName,
					consultingroomType: subItem.consultingroomType,
					officeName: subItem.officeName,
				});
				let websocket = socket.createWebSocket(`${WS_URL}/websocket/${subItem.consultingroomId}/4`, (message: any) => {
					let tempQueue = JSON.parse(message.data);
					//判断是否刷新页面
					reloadPage(tempQueue);
					let num = (index - 1) * subIndex + subIndex;
					consultingList.value[num].waitingQueue = tempQueue?.waitingQueue;
					tempQueue?.visitPatients.forEach((patientItem: any) => {
						patientItem.realityConsultingroomId === patientItem.consultingroomId
							? (consultingList.value[num].patientName = patientItem.patientName)
							: "";
					});
				});
				websocketList.push(websocket);
			});
		});
	});
});
//退出登录
const exit = () => {
	//清除登录信息，并跳转回登录界面
	proxy.$axios.post("/logout").then((res: any) => {
		ElMessage({
			type: "success",
			message: "退出成功！",
		});
		localStorage.removeItem("userInfo");
		router.push("/");
	});
};
onBeforeUnmount(() => {
	websocketList?.forEach((item: any) => {
		socket.closeWebSocket(item);
	});
});
</script>

<style lang="scss">
#nurse_consult {
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
					box-shadow: 1px 3px 0px 0px #274b99;
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
			box-shadow: inset 0px 0px 5px 4px #b2d5ff;
			overflow: hidden;
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
		}
	}
}
</style>
