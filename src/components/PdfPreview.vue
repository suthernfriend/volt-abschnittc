<script setup lang="ts">

const props = defineProps<{
	url: string;
	height?: string;
}>();

const rHeight = props.height || "800px";

</script>

<template>
	<div class="box">
		<iframe class="preview-frame" :src="props.url" width="100%" :height="rHeight"></iframe>
	</div>
</template>

<style scoped>

</style>