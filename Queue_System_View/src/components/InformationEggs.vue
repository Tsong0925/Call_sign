<template>
	<div class="information_eggs" @click="showDiv">
		<div v-show="information.show">
			<div>江苏世轩科技股份有限公司</div>
			<div>产品经理：谭龙 UI设计：陈思</div>
			<div>后端工程师：郭招招、李春贺</div>
			<div>前端工程师：王欣、刘润泽、龚永花</div>
		</div>
	</div>
</template>

<script lang="ts" setup>
let information = reactive({
	show: false, // 按钮是否可用
	showTime: 5, // 倒计时时间（单位：秒）
});
const showDiv = () => {
	information.show = true; // 禁用按钮
	let timer = setInterval(() => {
		clearInterval(timer);
		information.show = false; // 启用按钮
	}, information.showTime * 1000);
};
</script>

<style scoped>
.information_eggs {
	width: 200px;
	height: 50px;
	position: fixed;
	left: 0;
	bottom: 0;
    font-size:12px;
    color:silver;
    margin-left:10px;
    opacity: 0.3;
}
</style>
