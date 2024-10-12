<script setup lang="ts">


import { computed, ref } from "vue";
import { Evaluation } from "@/lib/Evaluation";
import { type Election, renderCandidateName } from "@/lib/Types";

const model = defineModel<Election>({ required: true });
const runoffWinner = ref<"none" | string>("none");

const evaluation = computed(() => new Evaluation({
	votes: [...model.value.counts.male, ...model.value.counts.female],
	candidates: model.value.candidates
}));

const result = computed(() => {
	return evaluation.value.evaluate();
});

function candidateNameById(id: string) {
	const candidate = model.value.candidates.find(c => c.id === id);
	if (!candidate)
		return "Unbekannt";
	return renderCandidateName(candidate);
}

const tables = {
	male: "Männlich / Diverse Vorabliste",
	female: "Weiblich / Diverse Vorabliste"
};

function numberFormat(n: number) {
	return n.toFixed(4);
}

</script>

<template>
	<div v-if="result.type === 'need-runoff'">
		<div class="columns">
			<div class="column" v-for="(title, k) in tables">
				<div class="box">
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
						<tr v-for="x in result.preliminaryLists[k]">
							<td>{{ x.position }}</td>
							<td>{{ candidateNameById(x.candidateId) }}</td>
							<td>{{ numberFormat(x.score) }}</td>
							<td>{{ x.shift }}</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="columns">
			<div class="column">
				<div class="box">
					<h4 class="title is-5">Zweiter Wahlgang benötigt</h4>
					<p class="content">
						Zwischen
						<strong>{{ candidateNameById(result.runoffCandidates.femaleCandidate) }}</strong>
						und
						<strong>{{ candidateNameById(result.runoffCandidates.maleCandidate) }}</strong>
						muss ein zweiter Wahlgang für den Spitzenplatz der Liste stattfinden.
					</p>
					<div class="block">
						<div class="select">
							<select v-model="runoffWinner">
								<option value="none">Nicht entschieden</option>
								<option :value="result.runoffCandidates.femaleCandidate">
									{{ candidateNameById(result.runoffCandidates.femaleCandidate) }}
								</option>
								<option :value="result.runoffCandidates.femaleCandidate">
									{{ candidateNameById(result.runoffCandidates.maleCandidate) }}
								</option>
							</select>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>