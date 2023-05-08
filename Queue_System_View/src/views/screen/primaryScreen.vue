<!--
* @FileDescription: 一级屏展示页面
* @router: primaryScreen
* @Author: 刘润泽
* @Date: 2023-03-13
* @LastEditors: 刘润泽
* @LastEditTime：2023-03-21
-->
<template>
  <div class="general_screen">
    <div class="screen_header">
      <div class="hospitalName">医院科室名</div>
      <div class="dateTime">
        <div class="date_area">
          <p class="week">{{ weekInfo }}</p>
          <p class="date">{{ dateInfo }}</p>
        </div>
        <div class="time">{{ timeInfo }}</div>
      </div>
    </div>
    <div class="screen_main">
      <div class="diagnostic_area">
        <div class="title">诊区位置： A栋1楼</div>
        <div class="department_list">
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
          <div class="department_info">
            <p>诊室名称：<span>卢本伟</span></p>
            <p>坐诊医生：<span>White</span></p>
            <p>正在就诊人：<span>五五开</span></p>
            <p>等待队列人数：<span>3人</span></p>
          </div>
        </div>
      </div>
    </div>
    <div class="screen_footer">
    </div>
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";

const state = reactive({
  scroll: true
});

let dateInfo = ref();
let weekInfo = ref();
let timeInfo = ref();
let week = ["日", "一", "二", "三", "四", "五", "六"];
let timer: any;
onMounted(() => {
  timer = setInterval(() => {
    let date: Date = new Date();
    let _week = Number(dayjs(date).format("d"));
    weekInfo.value = "星期" + week[_week];
    dateInfo.value = dayjs(date).format("YYYY年MM月DD日");
    timeInfo.value = dayjs(date).format("HH:mm");
  }, 1000);
});
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});

</script>

<style lang="scss">
.general_screen {
  width: 100%;
  height: 100%;
  background: #003E98;
  .screen_header {
    height: 80px;
    background: linear-gradient(270deg, #1654AC 0%, #1482FF 100%);
    border-radius: 0 0 20px 20px;
    display: flex;
    justify-content: space-between;
    .hospitalName {
      font-size: 32px;
      font-weight: 500;
      color: #FFFFFF;
      padding-left: 30px;
      line-height: 80px;
    }
    .dateTime {
      color: #FFFFFF;
      font-weight: 400;
      font-size: 48px;
      display: flex;
      padding-right: 30px;
      .date_area {
        text-align: right;
        font-size: 18px;
        height: 80px;
        position: absolute;
        top: 20px;
        right: 160px;
        .week {
          padding-bottom: 4px;
        }
      }
      .time {
        width: 120px;
        line-height: 80px;
      }
    }
  }
  .screen_main {
    height: calc(100% - 136px);
    overflow: hidden;
    .diagnostic_area {
      width: calc(100% - 60px);
      padding: 30px 30px 0 30px;
      .title {
        font-size: 24px;
        font-weight: 500;
        color: #FFFFFF;
        line-height: 36px;
      }
      .department_list {
        display: flex;
        gap: 20px;
        flex-wrap: wrap;
        .department_info {
          width: 194px;
          height: 120px;
          background: #025BC3;
          border: 1px solid #00A3CD;
          margin-top: 30px;
          padding: 33px 17px;
          p {
            font-size: 20px;
            font-weight: 400;
            color: #00A3CD;
            line-height: 30px;
            span {
              font-weight: 400;
              color: #FFFFFF;
            }
          }
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
    color: #FDA825;
    font-size: 24px;
    padding: 0 40px;
  }
}
</style>