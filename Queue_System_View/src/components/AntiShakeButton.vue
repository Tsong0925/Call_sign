<template>
  <el-button :disabled="buttonState.disabled" @click="startCountDown">
    <slot name="recall"></slot>
    {{ buttonState.disabled ? "(" + buttonState.countDown + ")" + "重呼" : props.recallBtn }}
  </el-button>
</template>

<script lang="ts">
export default {
  name: "AntiShakeButton"
};
</script>

<script lang="ts" setup>
const props = defineProps(['recallBtn'])
let buttonState = reactive({
  disabled: false, // 按钮是否可用
  countDown: 3 // 倒计时时间（单位：秒）
});
const startCountDown = () => {
  buttonState.disabled = true; // 禁用按钮
  let timer = setInterval(() => {
    if (buttonState.countDown > 0) {
      buttonState.countDown--;
    } else {
      clearInterval(timer);
      buttonState.disabled = false; // 启用按钮
      buttonState.countDown = 3; // 重置倒计时时间
    }
  }, 1000);
};
</script>

<style scoped>

</style>