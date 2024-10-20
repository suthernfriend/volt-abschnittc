<script setup lang="ts">

const props = defineProps<{
	size: 1 | 2 | 3
}>();

</script>

<template>
	<div class="block mt-5">
		<h1 v-if="props.size === 1" class="title is-1">
			<slot />
		</h1>
		<h2 v-else-if="props.size === 2" class="title is-2">
			<slot />
		</h2>
		<h3 v-else-if="props.size === 3" class="title is-3">
			<slot />
		</h3>
	</div>
</template>

<style scoped>

</style>