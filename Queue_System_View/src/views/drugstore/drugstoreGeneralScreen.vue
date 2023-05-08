<!--
* @FileDescription:药房端操作页面
* @Author: 龚永花
* @Date: 2023-03-13
* @LastEditors: 龚永花
* @LastEditTime：2023-03-27
-->
<template>
    <div class="page flex-col">
        <div class="top-part">
            <div class="image" style="width:250px">
                <img
                    class="image_1"
                    src="../../assets/images/logo/hospital_logo.png"
                />
                <div class="box2-card">
                    {{ state.consultingRoom }}
                </div>
            </div>
            <div class="drugstore">
                <span class="drugstore_word">{{ state.drugstore }}</span>
            </div>
            <div class="time">
                <div class="presentTime">{{ state.presentTime }}</div>
                <div>
                    <div class="year_week">
                        <div>{{state.presentYear}}</div>
                        <div class="week">{{ state.week }}</div>
                        
                    </div>
                    <div class="ip">{{ "编号：37.116" }}</div>
                </div>
            </div>
        </div>
        <div class="list_part">
            <div class="list" >
                <el-container class="takeMedicine">
                    <el-header class="take-list"> 
                        <span class="take-word">取号队列</span>
                    </el-header>
                    <el-main class="table_takeMedicine">
                        <el-table :header-cell-style="{background:'#084480'}" :row-class-name="tableRowClassName" class="table_takeMedicine_size" ref="multipleTable" :max-height="tableHeight" stripe :data="state.tableData.afterCallQueue" style="width: 100%;color: blue;">
                            <el-table-column prop="reginfoId" align="center" />
                            <el-table-column prop="patientName" align="center"/>
                            <el-table-column prop="realityConsultingroomName" align="center"/>
                            <!-- <el-table-column prop="status" align="center">
                                请取药
                            </el-table-column> -->
                        </el-table>
                    </el-main>
                </el-container>
                <el-container class="wait-part">
                    <el-header class="wait-list">
                        <span class="wait-word">等待队列</span>
                    </el-header>
                    <el-main class="table_wait">
                        <el-table :header-cell-style="{background:'#084480'}" class="wait_size" ref="multipleTable" :max-height="tableHeight" stripe :data="state.arrObjIndexEven" style="width: 50%">
                            <el-table-column prop="label" width="200px">
                            </el-table-column >
                            <el-table-column prop="value">
                            </el-table-column >
                        </el-table>
                        <el-table :header-cell-style="{background:'#084480'}" class="wait_size" ref="multipleTable" :max-height="tableHeight" stripe :data="state.arrObjIndexOdd" style="width: 50%">
                            <el-table-column   align="right" prop="label" width="200px">
                            </el-table-column>
                            <el-table-column prop="value">
                            </el-table-column>
                        </el-table>
                    </el-main>
                </el-container>
            </div>
        </div>
        <el-footer class="bottom-part" >
            <span class="bottom" >温馨提示：请保持安静!</span>
        </el-footer>
    </div>
</template>

<script setup lang="ts">
import { socket } from "@/utils/websocket";
const { proxy } = getCurrentInstance() as any;
let websocket = null as any;
const multipleTable = ref();
const tableHeight = ref();
const state = reactive({
    doctor:'王伟',
    consultingRoom:'内科诊室',
    presentTime:'',//当前年月
    presentYear:"",//当前时间
    time:'',
    week:"",
    month:"",
    second:"",
    drugstore:"西药房",
    tableData:{
        beforeCallQueue: [],//等待队列数据
        afterCallQueue: [],//取药队列数据
    },
    reginfoIdList:[],
    patientNameList:[],
    arrObj:[],
    arrObjIndexOdd:[],
    arrObjIndexEven:[],
})
//周几显示
const getWeekDate = () => {
    let now = new Date();
    let day = now.getDay();
    let weeks = ["星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六"];
    state.week = weeks[day];
}
//年月时间显示
const timePresent = () => {
    let t = null;
    t = setTimeout(timePresent, 1000);//开始运行
    clearTimeout(t);//清除定时器
    let dt = new Date();
    let y = dt.getFullYear(); // 获取年 
    let mt = dt.getMonth() + 1; // 获取月
    let day = dt.getDate(); // 获取日
    let h = dt.getHours(); //获取时
    let m = dt.getMinutes(); //获取分
    if (m >= 0 && m <= 9) {
        state.second = "0" + m;
        state.presentTime =  h + ":" + state.second
    }else{
        state.presentTime =  h + ":" + m 
    }
    let s = dt.getSeconds(); //获取秒
    if (mt >= 1 && mt <= 9) {
        state.month = "0" + mt;
    }
    state.presentYear =  y + "年" + state.month + "月" + day + "日" 
    t = setTimeout(timePresent, 1000); //设定定时器，循环运行 
}
//表格颜色设置
const tableRowClassName = () => ({row,rowIndex,}: {row: any ,rowIndex: number}) => {
    if ((rowIndex + 1) % 2 === 0) {
        return 'success-row';
      }
      return '';
}
//药房端等待队列数据获取
const getDrugstoreWaitData = () =>{
    websocket = socket.createWebSocket("ws://192.168.124.75:6480/websocket/666/3", (data: any) => {
        state.tableData = JSON.parse(data.data);
        console.log("2222",state.tableData.beforeCallQueue)
        //遍历出编号和姓名
        state.reginfoIdList = Object(state.tableData.beforeCallQueue).map((item:any) => {
            return item.reginfoId
        })
        state.patientNameList = Object(state.tableData.beforeCallQueue).map((item:any) => {
            return item.patientName
        })
        let arrObj=[]
        arrObj=Object(state.reginfoIdList).map((item:any,index:any)=>{return {label:item,value:state.patientNameList[index]}})
        state.arrObj = arrObj
        //获得等待数组列表中下标为奇数和偶数的元素列表
        state.arrObjIndexEven = state.arrObj.filter((item, index) => index % 2 === 0)
        state.arrObjIndexOdd = state.arrObj.filter((item, index) => index % 2 !== 0)
    })
}
onMounted(() => {
    timePresent()
    getWeekDate()
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
.page{
    background-color: #002B69;
    position: relative;
    width: 1280;
    height: 100%;
    overflow: hidden;
    .top-part{
        display: flex;
        justify-content:space-between;
        align-items: center;
        width: 1280;
        height: 80px;
        background: #FFF;
        box-shadow: inset 0px -5px 8px 0px rgba(116,116,116,0.35);
        border-radius: 0 0 20px 20px;
        .image{
            display: flex;
            .image_1{
                display: flex;
                height:60px;
                width: 60px;
                margin-left: 30px;
            }
            .box2-card{
                display: flex;
                font-weight: 500;
                margin-left: 10px;
                width: 96;
                height: 32;
                font-size: 32px;
                color: #050505;
                line-height: 48px;
            }
        }
        .drugstore{
            width: 542px;
            display: flex;
            height: 80px;
            background: linear-gradient(270deg, #1654AC 0%, #1482FF 100%);
            border-radius: 0 0 12px 12px;
            transform:perspective(4em) rotateX(2deg);
            margin-left: 100px;
            justify-content: space-around;
            align-items: center;
            .drugstore_word{
                //justify-content: center;
                width: 144px;
                height: 48px;
                color: rgba(255, 255, 255, 1);
                font-size: 48px;
                font-weight: 500;
                text-align: left;
                white-space: nowrap;
                line-height: 72px;
                //margin: 22px 0 0 202px;
                margin-bottom: 20px;
            }
        }
        .time{
            display: flex;
            margin-right: 60px;
            position: relative;
            .year_week{
                width: 200px;
                //height: 18px;
                display: flex;
                font-size: 18px;
                font-weight: 400;
                color: #323233;
                line-height: 27px;
                .week{
                   margin-left: 10px;
                }
            }
            .presentTime{
                width: 110px;
                height: 48px;
                font-size: 48px;
                font-weight: 400;
                color: #323233 ;
            }
            .ip{
                //display: flex;
                right: 12px;
                // top: 38px;
                font-size: 18px;
            }
        }
    }
    .list_part{
        height:calc(100% - 136px);
        .list{
            display: flex;
            padding: 20px;
            height: 80vh;
            .takeMedicine{
                width:738px;
                border: 1px solid let(--el-border-color);
                border-radius: 12px;
                background-color: #084480;
                .take-list{
                    display: flex;
                    //width: 1088px;
                    border-radius: 12px 12px 0 0;
                    height: 80px;
                    background-color: #00A445 ;
                    justify-content: space-around;
                    align-items: center;
                    .take-word{
                        width: 160px;
                        height: 40px;
                        font-size: 40px;
                        font-weight: 500;
                        color: #FFF;
                    }
                }
                .el-table{
                    height: 100%;
                    border-radius: 12px;
                    --el-table-border-color: #979797;
                    --el-table-tr-bg-color: transparent;
                    --el-table-header-bg-color: #0251c6;
                    background: #144286;
                    .table_takeMedicine{
                        display: flex;
                        padding: 0%;
                        background-color: #084480;
                        .table_takeMedicine_size{
                            display: flex;
                            font-size: 24px;
                            font-weight:bold;
                            background-color:#084480 ;
                        }
                    }
                }
                
            }
            .wait-part{
                width: 482px;
                border: 1px solid let(--el-border-color);
                border-radius:  12px;
                margin-left: 20px;
                background-color: #084480;
                .wait-list{
                    display: flex;
                    height: 80px;
                    background-color: #0251C6;
                    border-radius: 12px 12px 0 0;
                    justify-content: space-around;
                    align-items: center;
                    .wait-word{
                        width: 160px;
                        height: 40px;
                        font-size: 40px;
                        font-weight: 400;
                        color: #FFF;
                    }
                }
                // .el-table{
                    // height: 100%;
                    // border-radius: 12px;
                    // --el-table-border-color: #979797;
                    // --el-table-tr-bg-color: transparent;
                    // --el-table-header-bg-color: #0251c6;
                    // background: #144286;
                    .table_wait{
                        display: flex;
                        padding: 0;
                        background-color: #084480;
                        .wait_size{
                            display: flex;
                            font-weight:bold;
                            font-size: 24px;
                            background-color:#084480 ;
                            .cloHeight{
                                min-width: 36px;
                            }
                        }
                    }
                // }
            }
        }
    }
    .bottom-part{
        display: flex;
        height: 56px;
        background: #003179;
        border-radius: 20px 20px 0 0;
        justify-content: space-around;
        align-self: center;
        .bottom{
            width: 264px;
            height: 24px;
            font-size: 24px;
            font-weight: 400;
            color: #FFF;
            margin-top: 14px;
        }
    }
}

</style>