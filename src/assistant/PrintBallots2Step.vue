<script setup lang="ts">

import { toParagraphs } from "@/lib/utility";
import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { type Election, renderCandidateName } from "@/lib/Types";
import { computed, onMounted, ref } from "vue";
import Container from "@/lib/Container";

import type { EvaluationResult } from "@/lib/EvaluationResult";
import { runoffCandidateNames, voteEvaluator } from "@/lib/VoteEvaluator";

const props = defineProps<{
	step: AssistantProviderStep;
	election: Election;
}>();

const emits = defineEmits<{
	(event: "open"): void
}>();

const result = voteEvaluator(props.election);
const twoCandidates = computed(() => runoffCandidateNames(props.election, result.value));

</script>

<template>
	<div class="content" v-html="toParagraphs(props.step.explanation())" />
	<div class="block">
		Die Bewerber für den zweiten Wahlgang sind: {{ twoCandidates.join(" und ") }}
	</div>
	<div class="buttons">
		<button class="button is-primary" @click="emits('open')">
			Stimmzettel-Tab öffnen
		</button>
	</div>
</template>

<style scoped>

</style>
