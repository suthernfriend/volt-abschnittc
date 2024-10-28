<script setup lang="ts">

import { type ElectionCandidate, renderCandidateName } from "@/lib/Types";
import { numberFormat } from "@/lib/utility";
import type { EvaluationResultEntry } from "@/lib/EvaluationResult";

const props = defineProps<{
	title: string;
	result: EvaluationResultEntry[];
	candidates: ElectionCandidate[];
}>();

function candidateById(id: string): ElectionCandidate {
	return props.candidates.find((c) => c.id === id)!;
}

function candidateNameById(id: string) {
	const candidate = candidateById(id);
	if (!candidate) return "Unbekannt";
	return renderCandidateName(candidate);
}

</script>

<template>
	<h3 class="title is-4">{{ title }}</h3>
	<table class="table is-striped is-fullwidth">
		<thead>
		<tr>
			<th>Rang</th>
			<th>Bewerber*in</th>
			<th>Rating</th>
			<th>Shift</th>
		</tr>
		</thead>
		<tbody>
		<tr v-for="x in props.result">
			<td>{{ x.position }}</td>
			<td>{{ candidateNameById(x.candidateId) }}</td>
			<td>{{ numberFormat(x.score) }}</td>
			<td>{{ x.shift }}</td>
		</tr>
		</tbody>
	</table>
</template>

<style scoped>

</style>
