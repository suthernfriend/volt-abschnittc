<script setup lang="ts">
import { computed } from "vue";
import { Evaluation, type ListCompleteResult, type Result } from "@/lib/Evaluation";
import { type ElectionCandidate, type Election, renderCandidateName } from "@/lib/Types";
import { numberFormat } from "../lib/utility";

const model = defineModel<Election>({ required: true });

const props = defineProps<{
	result: Result;
}>();

function candidateById(id: string): ElectionCandidate {
	return model.value.candidates.find((c) => c.id === id)!;
}

function candidateNameById(id: string) {
	const candidate = candidateById(id);
	if (!candidate) return "Unbekannt";
	return renderCandidateName(candidate);
}

const tables = {
	male: "Männlich / Diverse Vorabliste",
	female: "Weiblich / Diverse Vorabliste",
};

const showPreliminary = computed(() => {
	return ["need-runoff", "list-complete"].includes(props.result.type);
});

const showFinal = computed(() => {
	return ["list-complete"].includes(props.result.type);
});
</script>

<template>
	<div class="columns" v-if="showPreliminary">
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
<!--						<select v-model="model.runoffWinner">-->
<!--							<option value="none">Nicht entschieden</option>-->
<!--							<option :value="result.runoffCandidates.femaleCandidate">-->
<!--								{{ candidateNameById(result.runoffCandidates.femaleCandidate) }}-->
<!--							</option>-->
<!--							<option :value="result.runoffCandidates.maleCandidate">-->
<!--								{{ candidateNameById(result.runoffCandidates.maleCandidate) }}-->
<!--							</option>-->
<!--						</select>-->
					</div>
				</div>
			</div>
		</div>
	</div>
	<div class="columns" v-if="showFinal">
		<div class="column">
			<div class="box">
				<h4 class="title is-5">Gesamtliste</h4>
				<table class="table is-striped is-fullwidth">
					<thead>
						<tr>
							<th>Rang</th>
							<th>Bewerber*in</th>
							<th>Ab Listenplatz</th>
							<th>Rating</th>
							<th>Shift</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="x in (result as ListCompleteResult).list">
							<td>{{ x.position }}</td>
							<td>{{ candidateNameById(x.candidateId) }}</td>
							<td>{{ candidateById(x.candidateId).minSpot }}</td>
							<td>{{ numberFormat(x.score) }}</td>
							<td>{{ x.shift }}</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
