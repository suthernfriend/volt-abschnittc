<script setup lang="ts">

import { toParagraphs } from "@/lib/utility";
import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { type Election, renderCandidateName } from "@/lib/Types";
import { computed, onMounted, ref } from "vue";
import type { Result } from "@/lib/Evaluation";
import Container from "@/lib/Container";

const props = defineProps<{
	step: AssistantProviderStep;
	election: Election;
}>();

const result = ref<Result>();

onMounted(async () => {
	const voteEvaluator = await Container.voteEvaluator();
	result.value = voteEvaluator.evaluate(props.election);

	console.log(result.value);
});

const twoCandidates = computed(() => {
	if (result.value?.type !== "need-runoff")
		return [];

	const candidates = [
		result.value.runoff.male,
		result.value.runoff.female
	].map(candidate => props.election.candidates.find(c => c.id === candidate)!)
		.map(value => renderCandidateName(value));

	return candidates.join(" und ");
});

</script>

<template>
	<div class="content" v-html="toParagraphs(props.step.explanation())" />
	<div class="block">
		Die Bewerber für den zweiten Wahlgang sind: {{ twoCandidates }}
	</div>
</template>

<style scoped>

</style>