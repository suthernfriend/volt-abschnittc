<script setup lang="ts">
import { type Candidate, renderCandidateName, sortCandidates } from "@/lib/Types";

const props = defineProps<{
	candidates: Candidate[];
}>();

function candidates(gender: "male" | "female") {
	return sortCandidates(props.candidates.filter(candidate => candidate.list === gender));
}

</script>
<template>
	<div class="box">
		<h3 class="title is-4">Neue Eingabe</h3>
		<div class="field px-3">
			<label class="label">Stimmzettel Nr.</label>
			<div class="control">
				<input type="text" class="input" placeholder="31">
			</div>
		</div>
		<table class="table is-fullwidth is-striped">
			<thead>
			<tr>
				<th>Name</th>
				<th>Punktzahl</th>
			</tr>
			</thead>
			<tbody>
			<tr v-for="(candidate, k) in candidates('male')">
				<td>
					{{ renderCandidateName(candidate) }}
					<em>(ab Listenplatz {{ candidate.minSpot }})</em>
				</td>
				<td><input type="text" class="input"></td>
			</tr>
			<tr>
				<td colspan="2">
					<button class="button is-primary">Hinzufügen</button>
				</td>
			</tr>
			</tbody>
		</table>
	</div>
</template>