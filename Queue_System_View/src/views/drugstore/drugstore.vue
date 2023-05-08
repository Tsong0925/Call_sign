<!--
* @FileDescription:药房端操作页面
* @Author: 龚永花
* @Date: 2023-03-13
* @LastEditors: 龚永花
* @LastEditTime：2023-03-24
-->
<template>
    <div class="page flex-col">
        <div class="top-part">
            <div class="box2-card">{{state.consultingRoom}}</div>
            <div class="windows">{{ state.WesternMedicineWindowNumber }}</div>
            <div class="onDoctor">欢迎你，{{state.doctor}}医生！
                <el-button class="exitButton mt-5" type="primary" @click="exit">退出</el-button>
            </div>
        </div>
        <div class="list_part">
            <el-container class="list">
                <div class="wait-list">
                    <div class="wait"><div class="block_1 flex-col"></div>等待队列</div>
                    <el-table class="table-wait" ref="multipleTable" :data="tableData.data.beforeCallQueue" size="large" :max-height="tableHeight" :show-header="false">
                        <el-table-column prop="reginfoId" align="center" label="队列序号" />
                        <el-table-column prop="patientName" align="center" label="患者姓名(备注)" />
                        <el-table-column prop="status" align="center" label="操作区域">
                            <template #default="{ row }">
                                <el-link style="height: 20px;width: 40px;" color="#23B7BE" @click="operateTakeMedicine(row.reginfoId)">
                                <span style="color: #0251C6;font-size: 20px;font-weight: 400;">取药</span>
                                </el-link>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
                <div class="takeMedicine-list">
                    <div class="take"><div class="block_2 flex-col"></div>取药队列</div>
                    <el-table class="table-take" ref="multipleTable" :max-height="tableHeight" :data="tableData.data.afterCallQueue" size="large" :show-header="false">
                        <el-table-column prop="reginfoId" align="center" label="队列序号"/>
                        <el-table-column prop="patientName" align="center" label="患者姓名(备注)"/>
                        <el-table-column prop="option" align="center" width="300px"  label="操作区域">
                            <template #default="{ row }">
                                <el-link @click="onRecall" style="font-weight:bold;height: 20px;width: 40px;">
                                <span style="color: #0251C6;font-size: 20px;font-weight: 400;">重呼</span>
                                </el-link>
                                <span style="color: rgba(204, 204, 204, 1);width: 20px;height: 20px;font-size: 20px;margin-left: 10px;margin-right: 10px;">|</span>
                                <el-link class="flex ml-20" style="height: 20px;width: 40px;" type="primary" @click="onSuccess(row.reginfoId)">
                                <span style="color: #0251C6;font-size: 20px;font-weight: 400;">完成</span>
                                </el-link>
                            </template>
                        </el-table-column>
                    </el-table>
                </div>
            </el-container>
        </div>
    </div>
</template>

<script setup lang="ts">
import { socket } from "@/utils/websocket";
const multipleTable = ref(); //为取药队列表进行绑定
const tableHeight = ref();
const router = useRouter(); //使用路由
const { proxy } = getCurrentInstance() as any;
let websocket = null as any;
const state = reactive({
    doctor:'王伟',
    consultingRoom:'安康市中心医院',
    WesternMedicineWindowNumber:"西药房一号窗口",
    tableHeight:0,//表格高度
    reginfoId:"",
})
const tableData = reactive({
    data:{
        beforeCallQueue: [],//等待队列数据
        afterCallQueue: [],//取药队列数据
    }
})
//退出登录
const exit = () => {
    console.log('333')
    router.push("/");
}
//重呼操作
const onRecall = () => {
    console.log("重呼");
}
//取药操作
const operateTakeMedicine = (item:any) =>{
    proxy.$axios.get(`/call/asc?staffId=y4&nextRegInfoId=${item}`)
    
}
//药房端等待队列数据获取
const getDrugstoreWaitData = () =>{
    websocket = socket.createWebSocket("ws://192.168.124.75:6480/websocket/666/3", (data: any) => {
       tableData.data = JSON.parse(data.data);
       console.log("tableData.data",tableData.data.afterCallQueue);
    });
}
//完成
const onSuccess = (item:any) => {
    proxy.$axios.get(`/call/endVisit?staffId=y4&regInfoId=${item}`); 
}
onMounted(() => {
    getDrugstoreWaitData()
    // 设置表格初始高度为innerHeight-offsetTop-表格底部与浏览器底部距离85
    tableHeight.value = window.innerHeight - multipleTable.value.$el.offsetTop - 85;
    // 监听浏览器高度变化
    window.onresize = () => {
        tableHeight.value = window.innerHeight - multipleTable.value.$el.offsetTop - 85;
    };
});
</script>

<style lang="scss">
.el-table, .el-table__expanded-cell {
    background-color: transparent;
}

.el-table th, .el-table tr {
    background-color: transparent;
}
.page{
    background: linear-gradient(180deg, #F5F5F5  100%, #F5F5F5  100%);
    //padding:30px;
    height:100%;
    width: 1280;
    position: relative;
    .top-part{
        display: flex;
        height: 96px;
        width: 1280;
        background: linear-gradient(180deg, #48A637  100%, #00A445 100%);
        box-shadow: inset 0px -5px 8px 0 rgba(116,116,116,0.35);
        display: flex;
        justify-content: space-between;
        align-items: center;
        .box2-card{
            float: left;
            font-size: 32px;
            color: white;
            line-height: 50px;
            margin-left: 20px;
        }
        .windows{
            font-size: 40px;
            color: white;
            line-height: 60px;
            font-weight: 500;
        }
        .exitButton{
            width: 68px;
            background: #FFF;
            border-radius: 4px;
            color: #0486FE;
            font-size: 24px;
        }
        .onDoctor{
            float: right;
            line-height: 50px;
            font-size: 20px;
            color: white;
            margin-right: 20px;
        }
    }
    .list_part{
        height:calc(100% - 96px);
        .list{
            padding: 20px;
            width: 100%;
            height:100%;
            .wait-list{
                width: 50%;
                //display: flex;
                border: 0 solid var(--el-border-color);
                border-radius: 56px 0 0 12px;
                background-color:#FFF;
                .wait{
                    display: flex;
                    justify-content: flex-start;
                    margin-top: 20px;
                    margin-left: 30px;
                    height: 32px;
                    font-size: 32px;
                    font-weight: 400;
                    color: #0251C6;
                    line-height: 48px;
                    .block_1 {
                        display: flex;
                        margin-top: 10px;
                        background-color: #0251C6;
                        width: 4px;
                        height: 32px;
                        margin-right: 20px
                    }
                }
                .table-wait{
                    display: flex;
                    margin-top: 20px;
                    border: none;
                    font-size: 20px;
                    font-weight:bold;
                    width: 100%;
                    color: #323233;
                }
            }
            .takeMedicine-list{
                border: 0 solid var(--el-border-color);
                border-radius: 0 56px 12px 0;
                background-color: #FFF;
                width: 50%;
                margin-left: 20px;
                .take{
                    display: flex;
                    justify-content: flex-start;
                    margin-top: 20px;
                    margin-left: 30px;  
                    width: 900px;
                    height: 32px;
                    font-size: 32px;
                    font-weight: 400;
                    color: #00A445;
                    line-height: 48px;
                    .block_2 {
                        display: flex;
                        margin-top: 10px;
                        background-color: #00A445;
                        width: 4px;
                        height: 32px;
                        margin-right: 20px
                    }
                }
                .table-take{
                    display: flex;
                    margin-top: 20px;
                    border: none;
                    font-size: 20px;
                    font-weight:bold;
                    width: 100%;
                    color: #323233;
                    
                }
            }
        }
    }
}

</style>