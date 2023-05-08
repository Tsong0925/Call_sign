<script setup lang="ts">
import { RouterView } from "vue-router";
import InformationEggs from "@/components/InformationEggs.vue";
onMounted(() => {});
</script>

<template>
	<RouterView />
	<InformationEggs />
</template>

<style lang="scss">
#app {
	height: 100%;
	position: relative;
}
</style>
