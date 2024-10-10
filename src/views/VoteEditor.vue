<script setup lang="ts">

import { ref } from "vue";
import type { Election } from "@/lib/Types";
import { type Candidate, renderCandidateName } from "@/lib/Types";

const election = defineModel<Election>();

const props = defineProps<{
	ballotId: number;
	candidates: Candidate[];
	maxRanking: number;
}>();

const rankings = ref<{ [candidateId: string]: string }>({});

function validateInputNumber(input: string): "invalid" | "valid" | "abstain" {

	if (["", "-", "-1"].includes(input)) {
		return "abstain";
	}

	const number = parseInt(input);

	if (isNaN(number)) {
		return "invalid";
	}

	if (number < 0 || number > props.maxRanking) {
		return "invalid";
	}

	return "valid";
}

function getRankingClass(candidate: Candidate): "is-danger" | "is-primary" | "is-info" {
	const ranking = rankings.value[candidate.id];

	const validationResult = validateInputNumber(ranking);

	switch (validationResult) {
		case "invalid":
			return "is-danger";
		case "abstain":
			return "is-info";
		default:
			return "is-primary";
	}
}

for (const candidate of props.candidates) {
	if (rankings.value[candidate.id] === undefined) {
		rankings.value[candidate.id] = "";
	}
}

</script>

<template>
	<div class="container">
		<h2 class="title">Neuen Stimmzettel-Anlegen</h2>

		<table class="table">
			<thead>
			<tr>
				<th></th>
				<th></th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="candidate in candidates">
				<td>{{ renderCandidateName(candidate) }}</td>
				<td><input type="text" class="input" :class="getRankingClass(candidate)"
						   v-model="rankings[candidate.id]"></td>
			</tr>
			</tbody>
		</table>
	</div>
</template>

<style scoped>

</style>