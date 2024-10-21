<script setup lang="ts">

import { computed, ref } from "vue";

const props = defineProps<{
	steps: number;
	current: number;
}>();

const d = computed(() => {
	return {
		before: props.current - 1,
		beforeDisabled: props.current <= 1,
		after: props.current + 1,
		afterDisabled: props.current >= props.steps - 1,
		first: 1,
		showFirst: props.current > 2,
		showLast: props.current < props.steps - 2,
		showBeforeEllipsis: props.current > 3,
		showAfterEllipsis: props.current < props.steps - 3,
		last: props.steps - 1,
		current: props.current
	};
});

const emits = defineEmits<{
	(event: "step-selected", step: number): void
}>();

function setStep(step: number) {
	emits("step-selected", step);
}

</script>

<template>
	<nav class="pagination is-centered">
		<button @click="setStep(d.before)" :disabled="d.beforeDisabled" class="pagination-previous">Vorriger
			Schritt
		</button>
		<button @click="setStep(d.after)" :disabled="d.afterDisabled" class="pagination-next">Nächster
			Schritt
		</button>
		<ul class="pagination-list">
			<li v-if="d.showFirst">
				<button @click="setStep(d.first)" class="pagination-link">1</button>
			</li>
			<li v-if="d.showBeforeEllipsis">
				<span class="pagination-ellipsis">&hellip;</span></li>
			<li v-if="!d.beforeDisabled">
				<button @click="setStep(d.before)" class="pagination-link">{{ d.before }}</button>
			</li>
			<li>
				<a class="pagination-link is-current">{{ current }}</a>
			</li>
			<li v-if="!d.afterDisabled">
				<button @click="setStep(d.after)" class="pagination-link">{{ current + 1 }}</button>
			</li>
			<li v-if="d.showAfterEllipsis">
				<span class="pagination-ellipsis">&hellip;</span></li>
			<li v-if="d.showLast">
				<button @click="setStep(d.last)" class="pagination-link">{{ (d.last) }}</button>
			</li>
		</ul>
	</nav>
</template>

<style scoped>

</style>