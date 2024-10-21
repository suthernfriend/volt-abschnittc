<script setup lang="ts">

const props = defineProps<{
	label: string;
}>()

</script>

<template>
	<div class="field is-horizontal">
		<div class="field-label is-normal">
			<label class="label">{{ label }}</label>
		</div>
		<div class="field-body">
			<div class="field">
				<p class="control">
					<slot />
				</p>
			</div>
		</div>
	</div>

</template>

<style scoped>

</style>