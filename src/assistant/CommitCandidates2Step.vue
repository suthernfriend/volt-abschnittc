<script setup lang="ts">
import { toParagraphs } from "@/lib/utility";
import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { type Election } from "@/lib/Types";
import { computed } from "vue";
import { runoffCandidateNames, voteEvaluator } from "@/lib/VoteEvaluator";

const props = defineProps<{
	step: AssistantProviderStep;
	election: Election;
}>();

const result = voteEvaluator(props.election);
const twoCandidates = computed(() => runoffCandidateNames(props.election, result.value));

</script>

<template>
	<div class="content" v-html="toParagraphs(props.step.explanation())" />
	<div class="block">Die Bewerber für den zweiten Wahlgang sind: {{ twoCandidates.join(" und ") }}</div>
</template>

<style scoped></style>
