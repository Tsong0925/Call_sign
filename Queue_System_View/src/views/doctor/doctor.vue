<!--
* @FileDescription: 医生端操作页面
* @router: doctor
* @Author: 刘润泽
* @Date: 2023-03-13
* @LastEditors: 刘润泽
* @LastEditTime：2023-03-30
-->
<template>
  <div class="doctor">
    <div class="doctor-header">
      <div class="logo">
        {{ userInfo.consultingroomName }}
      </div>
      <div class="login-doctor">
        欢迎您，{{ userInfo.staffName }}医生！
        <el-button @click="exit">退出</el-button>
      </div>
    </div>
    <div class="doctor-main">
      <div class="visiting-operate">
        <span id="status">{{ visitPatient.queueStats }}</span>
        <span id="patient">
					{{ visitPatient?.appointVisitno + " " + visitPatient?.patientName + " " + visitPatient?.statsFirstvisit }}
				</span>
        <div class="operate">
          <anti-shake-button
            type="primary"
            color="#04A3FE"
            v-show="!isReCall && visitPatient.queueStats === '准备叫号：'"
            recallBtn="顺呼"
            @click="nextPatient(nextPatientId[0].reginfoId)"
          >
            顺呼
          </anti-shake-button>
          <anti-shake-button
            type="primary"
            color="#04A3FE"
            v-show="isReCall && visitPatient.queueStats === '正在叫号：'"
            recallBtn="重呼"
            @click="reCall(visitPatient.reginfoId)"
          ></anti-shake-button>
          <el-button
            type="primary"
            color="#0486FE"
            v-show="visitPatient.queueStats === '正在叫号：'"
            @click="startVisit(visitPatient.reginfoId)"
          >
            开始就诊
          </el-button>
          <el-button
            type="primary"
            color="#577896"
            :disabled="isStartVisit.flag"
            v-show="visitPatient.queueStats === '正在就诊：'"
            @click="endVisit(visitPatient.reginfoId)"
          >
            <span v-if="isStartVisit.flag">{{ "（" + isStartVisit.countDown + "）" }}</span>
            结诊
          </el-button>
          <el-button
            type="primary"
            color="#DB6565"
            :disabled="visitPatient.queueStats !== '正在叫号：' || !isReCall"
            @click="overNumbered(visitPatient.reginfoId)"
          >
            过号
          </el-button>
        </div>
      </div>
      <div class="main-area">
        <div class="table-area" style="width: 100%">
          <el-table ref="tableRef" stripe size="large" :height="tableHeight" :data="tableData.showData">
            <el-table-column label="序号" type="index" width="70" align="center" />
            <el-table-column label="排队序号" align="center" prop="appointVisitno" />
            <el-table-column label="患者姓名" align="center">
              <template v-slot="scope">
                <div v-if="scope.row.statsFirstvisit === '0'">
                  <span>{{ `${scope.row.patientName} （初诊）` }}</span>
                </div>
                <div v-else-if="scope.row.statsFirstvisit === '1'">
                  <span>{{ `${scope.row.patientName} （复诊）` }}</span>
                </div>
                <div v-else-if="scope.row.statsFirstvisit === '2'">
                  <span>{{ `${scope.row.patientName} （过号）` }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="状态" align="center">
              <template v-slot="scope">
                <span v-if="scope.row?.queueStats === '01'" style="color: #027ff9">候诊中</span>
                <span v-else-if="scope.row?.queueStats === '02'" style="color: #56d247">就诊中</span>
                <span v-else-if="scope.row?.queueStats === '03'" style="color: orange">已呼叫</span>
                <span v-else-if="scope.row?.queueStats === '04'">完诊</span>
                <span v-else-if="scope.row?.queueStats === '05'">挂起</span>
                <span v-else-if="scope.row?.queueStats === '06'">弃号</span>
                <span v-else-if="scope.row?.queueStats === '07'">过号</span>
              </template>
            </el-table-column>
            <el-table-column label="操作区域" align="center">
              <template v-slot="scope">
                <el-button
                  class="call_button"
                  link
                  @click="nextPatient(scope.row.reginfoId)"
                  v-if="activeTab === 'notAllowedPeople'"
                >
                  呼叫
                </el-button>
                <el-popconfirm
                  confirm-button-text="确认"
                  cancel-button-text="取消"
                  icon-color="#626AEF"
                  title="确认将此患者重新加入队列吗?"
                  @confirm="againPutQueue(scope.row)"
                  v-else-if="activeTab === 'overNumQueue'"
                >
                  <template #reference>
                    <el-button link type="primary" style="color: #0081c9">重新加入队列</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div class="change-area">
          <el-tabs v-model="activeTab" type="card" tab-position="right" @tab-click="handleTabsClick">
            <el-tab-pane :label="'未呼叫\n(' + queueNum.notAllowedPeople + ')'" name="notAllowedPeople" />
            <el-tab-pane :label="'过号\n(' + queueNum.overNumberPeople + ')'" name="overNumQueue" />
            <el-tab-pane :label="'诊结\n(' + queueNum.finishedPeople + ')'" name="finishQueue" />
          </el-tabs>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TabsPaneContext } from "element-plus";
import { socket } from "@/utils/websocket";
import AntiShakeButton from "@/components/AntiShakeButton.vue";
import { ElMessage } from "element-plus";
import { reloadPage, WS_URL } from "@/utils/util";

//获取代理
const { proxy } = getCurrentInstance() as any;
let websocket = null as any;

interface visitPatient {
  reginfoId?: string;
  patientName?: string;
  statsFirstvisit?: string;
  queueStats?: string;
  appointVisitno?: string;
}

//正在就诊人
let visitPatient = reactive<visitPatient>({
  reginfoId: "",
  patientName: "",
  statsFirstvisit: "",
  queueStats: "准备叫号：",
  appointVisitno: ""
});
//第一候诊人
let nextPatientId = ref();
//是否重新呼叫
let isReCall = ref<boolean>(false);
//是否开始就诊
let isStartVisit = reactive({
  flag: true,
  countDown: 3
});
//默认展示tab
let activeTab = ref("notAllowedPeople");
//用户信息
let userInfo = ref<any>({});

interface queueNum {
  notAllowedPeople?: number;
  overNumberPeople?: number;
  finishedPeople?: number;
}

let queueNum = reactive<queueNum>({
  notAllowedPeople: 0,
  overNumberPeople: 0,
  finishedPeople: 0
});

interface tableData {
  data: {
    waitingQueue?: string[];
    finishQueue?: string[];
    firstQueue?: string[];
    overNumQueue?: string[];
    secondQueue?: string[];
    visitPatients?: string[];
  };
  showData?: string[];
}

let tableData = reactive<tableData>({
  data: {},
  showData: []
});

// table元素
const tableRef = ref();
// table高度
const tableHeight = ref();

onMounted(() => {
  userInfo.value = JSON.parse(localStorage.getItem("userInfo") as any);
  // 设置表格初始高度为innerHeight-offsetTop-表格底部与浏览器底部距离60
  tableHeight.value = window.innerHeight - tableRef?.value.$el.offsetTop - 60;
  // 监听浏览器高度变化
  window.onresize = () => {
    tableHeight.value = window.innerHeight - tableRef?.value.$el.offsetTop - 60;
  };
  //获取队列，应放在登录后
  websocket = socket.createWebSocket(`${WS_URL}/websocket/${userInfo.value.consultingroomId}/5`, (message: any) => {
  //websocket = socket.createWebSocket(`ws://192.168.1.204:6480/websocket/${userInfo.value.consultingroomId}/5`, (message: any) => {
    console.log(JSON.parse(message.data));
    let officeQueue = JSON.parse(message.data);
    //判断是否刷新页面
    reloadPage(officeQueue);
    //刷新后重置开始就诊按钮状态
    if (officeQueue.visitPatients[0]?.queueStats === "02") {
      isStartVisit.flag = false;
    }
    //刷新后重置重呼状态
    if (officeQueue.visitPatients[0]?.queueStats === "03") {
      isReCall.value = true;
    }
    //   websocket = socket.createWebSocket(`ws://10.8.1.106:6480/websocket/${userInfo.value.consultingroomId}/5`, (message: any) => {
    officeQueue.visitPatients.forEach((item: any) => {
      if (item.realityConsultingroomId === userInfo.value.consultingroomId) {
        visitPatient.reginfoId = item.reginfoId;
        visitPatient.appointVisitno = item.appointVisitno;
        visitPatient.patientName = item.patientName;
        if (item.statsFirstvisit === "0") visitPatient.statsFirstvisit = "（初诊）";
        else if (item.statsFirstvisit === "1") visitPatient.statsFirstvisit = "（复诊）";
        else if (item.statsFirstvisit === "2") visitPatient.statsFirstvisit = "（过号）";
        if (item.queueStats == "") {
          visitPatient.queueStats = "准备叫号：";
        } else if (item.queueStats == "03") {
          visitPatient.queueStats = "正在叫号：";
        } else {
          visitPatient.queueStats = "正在就诊：";
        }
      }
    });
    tableData.data = JSON.parse(message.data);
    tableData.showData = tableData.data?.waitingQueue;
    queueNum.notAllowedPeople = tableData.data?.waitingQueue?.length;
    queueNum.overNumberPeople = tableData.data?.overNumQueue?.length;
    queueNum.finishedPeople = tableData.data?.finishQueue?.length;
  });
});

//等待队列数据监听
watch(
  () => tableData.data.waitingQueue,
  (newValue: any, _) => {
    nextPatientId = newValue;
  },
  { immediate: true }
);

//使用路由
const router = useRouter();
//退出登陆
const exit = () => {
  //清除登录信息，并跳转回登录界面
  proxy.$axios.post("/logout", { staffId: userInfo.value?.staffId }).then((res: any) => {
    ElMessage({
      type: "success",
      message: "退出成功！"
    });
    localStorage.removeItem("userInfo");
    router.push("/");
  });
};

//顺呼
const nextPatient = (data: string) => {
  isReCall.value = true;
  proxy.$axios.get(`/call/asc?staffId=${userInfo.value?.staffId}&nextRegInfoId=${data}`).then((res: any) => {
    if (res.data.message == "成功") {
      const { patientName, reginfoId, statsFirstvisit, appointVisitno } = res.data.data;
      ElMessage({ type: "success", message: "呼叫成功！" });
      visitPatient.queueStats = "正在叫号：";
      visitPatient.reginfoId = reginfoId;
      visitPatient.appointVisitno = appointVisitno;
      visitPatient.patientName = patientName;
      visitPatient.statsFirstvisit = statsFirstvisit == "0" ? "（初诊）" : "（复诊）";
    } else {
      ElMessage({ type: "error", message: "呼叫失败！" });
    }
  });
};

//重呼
const reCall = (data: any) => {
  proxy.$axios.get(`/call/again?consultingroomId=${userInfo.value?.consultingroomId}&regInfoId=${data}`).then((res: any) => {
    if (res?.data?.status === "fail") {
      ElMessage(res?.data?.data);
    } else {
      ElMessage({ type: "success", message: "重呼成功" });
    }
  });
};

//开始就诊
const startVisit = (data: any) => {
  proxy.$axios.get(`/call/startVisit?staffId=${userInfo.value?.staffId}&regInfoId=${data}`).then(() => {
    let timer = setInterval(() => {
      if (isStartVisit.countDown > 0) {
        isStartVisit.countDown--;
      } else {
        clearInterval(timer);
        isStartVisit.flag = false; // 启用按钮
        isStartVisit.countDown = 3; // 重置倒计时时间
      }
    }, 1000);
    ElMessage({ type: "success", message: "开始就诊！" });
    visitPatient.queueStats = "正在就诊：";
    isReCall.value = false;
  });
};

//结诊
const endVisit = (data: any) => {
  proxy.$axios.get(`/call/endVisit?staffId=${userInfo.value?.staffId}&regInfoId=${data}`).then(() => {
    ElMessage({ type: "success", message: "诊结成功！" });
    visitPatient.queueStats = "准备叫号：";
    visitPatient.reginfoId = "";
    visitPatient.patientName = "";
    visitPatient.statsFirstvisit = "";
    visitPatient.appointVisitno = "";
    isReCall.value = false;
    isStartVisit.flag = true;
  });
};

//过号
const overNumbered = (data: any) => {
  proxy.$axios.get(`/call/overNum?staffId=${userInfo.value?.staffId}&regInfoId=${data}`).then((res: any) => {
    if (res?.data?.status === "fail") {
      ElMessage(res?.data?.data);
    } else {
      visitPatient.queueStats = "准备叫号：";
      visitPatient.reginfoId = "";
      visitPatient.patientName = "";
      visitPatient.statsFirstvisit = "";
      visitPatient.appointVisitno = "";
      isReCall.value = false;
      isStartVisit.flag = true;
      ElMessage({ type: "success", message: "过号成功！" });
    }
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

//切换tabs
const handleTabsClick = (tab: TabsPaneContext) => {
  activeTab.value = tab.paneName as string;
  if (tab.paneName == "notAllowedPeople") {
    tableData.showData = tableData.data.waitingQueue;
  } else if (tab.paneName == "overNumQueue") {
    tableData.showData = tableData.data.overNumQueue;
  } else if (tab.paneName == "finishQueue") {
    tableData.showData = tableData.data.finishQueue;
  }
};

//组件卸载关闭websocket连接
onBeforeUnmount(() => {
  socket.closeWebSocket(websocket);
});
</script>

<style lang="scss">
.doctor {
  padding: 30px;
  height: calc(100% - 60px);
  background: #274b99;

  .doctor-header {
    height: 86px;
    width: 100%;
    display: flex;
    justify-content: space-between;

    .logo {
      float: left;
      font-size: 40px;
      color: white;
      line-height: 50px;
    }

    .login-doctor {
      float: right;
      line-height: 50px;
      font-size: 24px;
      color: white;

      .el-button {
        width: 68px;
        background: #ffffff;
        border-radius: 4px;
        color: #0486fe;
        font-size: 24px;
      }
    }
  }

  .doctor-main {
    height: calc(100% - 164px);
    width: calc(100% - 30px);
    background: white;
    box-shadow: inset 4px 6px 14px 0 #b2d5ff, inset -4px -6px 12px 0px #b2d5ff;
    border-radius: 56px 56px 12px 12px;
    padding: 48px 0 30px 30px;
    justify-content: space-between;

    .visiting-operate {
      font-size: 32px;
      font-weight: 400;

      #status {
        color: #323233;
      }

      #patient {
        color: #0486fe;
      }

      height: 70px;
      display: table;
      width: 100%;

      .operate {
        float: right;
        margin-right: 30px;

        .el-button {
          margin-left: 20px;
          border-radius: 4px;
          width: 102px;
          height: 40px;
          font-size: 20px;
          color: #ffffff;
        }
      }
    }

    .main-area {
      display: flex;

      .el-table {
        --el-table-header-bg-color: #eff6ff;

        .call_button {
          font-weight: 400;
          color: #0486fe;
        }
      }

      .change-area {
        width: 90px;

        .el-tabs--card > .el-tabs__header .el-tabs__nav {
          border: none;
        }

        .el-tabs--right {
          --el-transition-duration: false;

          .el-tabs__header.is-right {
            margin-left: 0;
          }

          .el-tabs__item.is-right {
            width: 75px;
            height: 104px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #ffffff;
            font-size: 20px;
            background: #274b99;
            white-space: pre-line;
            text-align: center;
            padding: 0;

            &.is-active {
              background: #0486fe;
              width: 90px;
              border: none;
              box-shadow: inset -4px 4px 14px 0px rgba(39, 75, 153, 0.6);
              color: #ffffff;
              border-radius: 0 12px 12px 0;
            }
          }

          #tab-notAllowedPeople {
            border-radius: 0 12px 0 0;
          }

          #tab-finishQueue {
            border-radius: 0 0 12px 0;
          }
        }
      }
    }
  }
}
</style>
