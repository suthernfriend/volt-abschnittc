<script setup lang="ts">
import { type Election, renderCandidateName, type Vote } from "@/lib/Types";
import { ref } from "vue";
import VoteCreate from "@/views/VoteCreate.vue";
import FormField from "@/components/FormField.vue";
import { voteEvaluator } from "@/lib/VoteEvaluator";
import { hasRunoffCandidates } from "@/lib/EvaluationResult";

const election = defineModel<Election>({ required: true });
type ViewType = "input-md" | "input-wd" | "start";
const view = ref<ViewType>("start");

const result = voteEvaluator(election);

function setView(newView: ViewType) {
	view.value = newView;
}

function candidateName(id: string) {
	const candidate = election.value.candidates.find((c) => c.id === id);
	if (!candidate) return "Unbekannt";
	return renderCandidateName(candidate);
}

function addVote(vote: Vote) {
	election.value.votes.push(vote);
	view.value = "start";
}
</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Stimmeingabe</h2>
		</div>
		<div class="columns" v-if="view === 'input-md'">
			<div class="column">
				<vote-create @created="addVote" gender="male" :candidates="election.candidates" />
			</div>
		</div>
		<div class="columns" v-if="view === 'input-wd'">
			<div class="column">
				<vote-create @created="addVote" gender="female" :candidates="election.candidates" />
			</div>
		</div>
		<div class="columns" v-else-if="view === 'start'">
			<div class="column">
				<h3 class="title is-3">1. Wahlgang</h3>

				<div>
					<h4 class="title is-4">Neue Stimmzettel eintragen</h4>
					<div class="buttons">
						<button @click="setView('input-md')" class="button is-primary">Neue Eingabe (M/D)</button>
						<button @click="setView('input-wd')" class="button is-primary">Neue Eingabe (W/D)</button>
					</div>
				</div>
				<div>
					<h4 class="title is-4">Zählungen</h4>
					<table>
						<thead>
							<tr>
								<th>Stimmzettel #</th>
								<th>Eintragungen #</th>
								<th>Zeitpunkt</th>
								<th>Status</th>
								<th></th>
							</tr>
							<tr>
								<th></th>
							</tr>
						</thead>
						<tbody>
							<>
							<tr>
								<td></td>
								<td></td>
								<td></td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
		<div class="column">
			<h3 class="title is-3">2. Wahlgang</h3>

			<div v-if="result && hasRunoffCandidates(result)" v-for="(_, k) in result.runoff">
				<h4 class="title is-4">Ergebnis ({{ k + 1 }}. Stichwahl)</h4>
				<form-field :label="candidateName(result.runoff[0].male)">
					<input type="number" v-model="election.runoffs[0].male" />
				</form-field>
				<form-field :label="candidateName(result.runoff[0].female)">
					<input type="number" v-model="election.runoffs[0].female" />
				</form-field>
				<form-field label="Enthaltungen">
					<input type="number" v-model="election.runoffs[0].abstentions" />
				</form-field>
			</div>
		</div>

		<!--		<div class="column">-->
		<!--			<div class="box">-->
		<!--				<h3 class="title is-4">Kontrolle</h3>-->
		<!--				<table class="table is-fullwidth is-striped">-->
		<!--					<thead>-->
		<!--					<tr>-->
		<!--						<th>Stimmzettel-Nr.</th>-->
		<!--						<th>Beschreibung</th>-->
		<!--					</tr>-->
		<!--					</thead>-->
		<!--					<tbody>-->
		<!--					&lt;!&ndash;						<tr v-for="(ballot, id) in missmatchedBallots">&ndash;&gt;-->
		<!--					&lt;!&ndash;							<td>{{ id }}</td>&ndash;&gt;-->
		<!--					&lt;!&ndash;							<td>&ndash;&gt;-->
		<!--					&lt;!&ndash;								<ul>&ndash;&gt;-->
		<!--					&lt;!&ndash;									<li v-for="entry in voteDiff(ballot.counts[0], ballot.counts[1])">&ndash;&gt;-->
		<!--					&lt;!&ndash;											<span v-if="entry.type === 'missing-candidate'">&ndash;&gt;-->
		<!--					&lt;!&ndash;												Bewerber*in {{ candidateName(entry.candidateId) }} fehlt in der Zählung von Stimmzettel&ndash;&gt;-->
		<!--					&lt;!&ndash;												{{ id }}&ndash;&gt;-->
		<!--					&lt;!&ndash;											</span>&ndash;&gt;-->
		<!--					&lt;!&ndash;										<span v-else-if="entry.type === 'points-missmatch'">&ndash;&gt;-->
		<!--					&lt;!&ndash;												Die Punktevergabe für Bewerber*in {{ candidateName(entry.candidateId) }} unterscheidet sich&ndash;&gt;-->
		<!--					&lt;!&ndash;												({{ entry.pointsA }} vs. {{ entry.pointsB }})&ndash;&gt;-->
		<!--					&lt;!&ndash;											</span>&ndash;&gt;-->
		<!--					&lt;!&ndash;									</li>&ndash;&gt;-->
		<!--					&lt;!&ndash;								</ul>&ndash;&gt;-->
		<!--					&lt;!&ndash;								<button class="button is-small is-danger">Dritte Zählung</button>&ndash;&gt;-->
		<!--					&lt;!&ndash;							</td>&ndash;&gt;-->
		<!--					&lt;!&ndash;						</tr>&ndash;&gt;-->
		<!--					</tbody>-->
		<!--				</table>-->
		<!--			</div>-->
		<!--		</div>-->
	</div>
</template>

<style scoped></style>
