<script setup lang="ts">

import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { toParagraphs } from "@/lib/utility";
import { onMounted, ref } from "vue";
import Container from "@/lib/Container";
import type { Election } from "@/lib/Types";

import type { EvaluationResult } from "@/lib/EvaluationResult";

const props = defineProps<{
	step: AssistantProviderStep;
	linkTitle: string;
	election: Election;
}>();

const emits = defineEmits<{
	(event: "open"): void
}>();

const result = ref<EvaluationResult>();

onMounted(async () => {
	const voteEvaluator = await Container.voteEvaluator();
	result.value = voteEvaluator.evaluate(props.election);
});

</script>

<template>
	<div class="content" v-html="toParagraphs(props.step.explanation())" />
	<div v-if="result?.type === 'need-lot'" class="message is-danger">
		<div class="message-body">
			Das Auslosen von Plätzen ist notwendig.
		</div>
	</div>
	<div v-else class="message is-success">
		<div class="message-body">
			Das Auslosen von Plätzen ist nicht notwendig.
		</div>
	</div>
	<div class="buttons">
		<button class="button is-primary" @click="emits('open')">{{ linkTitle }}</button>
	</div>
</template>

<style scoped>

</style>
