<script setup lang="ts">

import TitleBlock from "@/components/TitleBlock.vue";
import { onMounted, ref } from "vue";
import type { AssistantStep } from "@/lib/AssistantProvider";
import Container from "@/lib/Container";

const steps = ref<AssistantStep[]>();
const current = ref<number>(1);

onMounted(async () => {
	const assistantProvider = await Container.assistantProvider();
	steps.value = assistantProvider.getSteps();
});

function setStep(n: number) {
	current.value = n;
}

</script>

<template>
	<div class="container">
		<title-block :size="2">Abstimmungsassistent</title-block>
		<nav class="pagination is-centered">
			<a @click="setStep(current - 1)" class="pagination-previous">Previous Step</a>
			<a @click="setStep(current + 1)"  class="pagination-next">Next Step</a>
			<ul class="pagination-list">
				<li v-if="current > 1"><a class="pagination-link">1</a></li>
				<li v-if="current > 2"><span class="pagination-ellipsis">&hellip;</span></li>
				<li v-if="current > 2"><a class="pagination-link">{{ current - 1 }}</a></li>
				<li>
					<a class="pagination-link is-current">{{ current }}</a>
				</li>
				<li><a class="pagination-link">{{  current + 1 }}</a></li>
				<li><span class="pagination-ellipsis">&hellip;</span></li>
				<li><a class="pagination-link">{{ (steps?.length ?? 0) - 1 }}</a></li>
			</ul>
		</nav>
		<div class="block" v-if="steps">
			<div class="box">
				<h3 class="title is-4">{{ steps[current - 1].title() }}</h3>
				<p>{{ steps[current - 1].explanation() }}</p>
				<app-configuration v-if="steps[current - 1]." />
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>