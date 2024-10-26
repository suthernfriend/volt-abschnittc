<script setup lang="ts">
import { computed } from "vue";
import { Evaluation, type ListCompleteResult, type Result } from "@/lib/Evaluation";
import { type ElectionCandidate, type Election, renderCandidateName } from "@/lib/Types";
import { numberFormat } from "@/lib/utility";
import FormField from "@/components/FormField.vue";

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
	female: "Weiblich / Diverse Vorabliste"
};

const showPreliminary = computed(() => {
	return ["need-runoff", "list-complete"].includes(props.result.type);
});

const showFinal = computed(() => {
	return ["list-complete"].includes(props.result.type);
});

</script>

<template>
	<div class="columns" v-if="showPreliminary && result.type !== 'need-lot'">
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
	<div class="columns" v-if="result.type != 'need-lot'">
		<div class="column">
			<div class="box">
				<h4 class="title is-5">Zweiter Wahlgang benötigt</h4>
				<p class="content">
					Zwischen
					<strong>{{ candidateNameById(result.runoff.female) }}</strong>
					und
					<strong>{{ candidateNameById(result.runoff.male) }}</strong>
					muss ein zweiter Wahlgang für den Spitzenplatz der Liste stattfinden.
				</p>
				<div class="block" v-for="(k, i) in model.runoffs">
					<h4>{{ i }}</h4>
					<form-field :label="candidateNameById(result.runoff.male)">
						<input type="number" class="input" v-model="model.runoffs[i].male">
					</form-field>
					<form-field :label="candidateNameById(result.runoff.female)">
						<input type="number" class="input" v-model="model.runoffs[i].female">
					</form-field>
					<form-field label="Enthaltungen">
						<input type="number" class="input" v-model="model.runoffs[i].abstentions">
					</form-field>
					<form-field label="Gesamt">
						<input type="number" class="input" v-model="model.runoffs[i].total">
					</form-field>
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
