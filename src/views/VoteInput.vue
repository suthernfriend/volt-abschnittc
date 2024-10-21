<script setup lang="ts">
import { type Election, renderCandidateName, type Vote, voteDiff, voteEquals } from "@/lib/Types";
import { computed, ref } from "vue";
import VoteCreate from "@/views/VoteCreate.vue";

const election = defineModel<Election>({ required: true });
type ViewType = "input-md" | "input-wd" | "start";
const view = ref<ViewType>("start");

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
				<vote-create @created="addVote" gender="male"
							 :candidates="election.candidates" />
			</div>
		</div>
		<div class="columns" v-if="view === 'input-wd'">
			<div class="column">
				<vote-create @created="addVote" gender="female"
							 :candidates="election.candidates" />
			</div>
		</div>
		<div class="columns" v-else-if="view === 'start'">
			<div class="column">
				<div class="box">
					<h3 class="title is-4">Zählung</h3>
					<div class="buttons">
						<button @click="setView('input-md')" class="button is-primary">Neue Eingabe (M/D)</button>
						<button @click="setView('input-wd')" class="button is-primary">Neue Eingabe (W/D)</button>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="box">
					<h3 class="title is-4">Status</h3>
					<div class="block">
					</div>
				</div>
			</div>
			<div class="column">
				<div class="box">
					<h3 class="title is-4">Kontrolle</h3>
					<table class="table is-fullwidth is-striped">
						<thead>
						<tr>
							<th>Stimmzettel-Nr.</th>
							<th>Beschreibung</th>
						</tr>
						</thead>
						<tbody>
						<!--						<tr v-for="(ballot, id) in missmatchedBallots">-->
						<!--							<td>{{ id }}</td>-->
						<!--							<td>-->
						<!--								<ul>-->
						<!--									<li v-for="entry in voteDiff(ballot.counts[0], ballot.counts[1])">-->
						<!--											<span v-if="entry.type === 'missing-candidate'">-->
						<!--												Bewerber*in {{ candidateName(entry.candidateId) }} fehlt in der Zählung von Stimmzettel-->
						<!--												{{ id }}-->
						<!--											</span>-->
						<!--										<span v-else-if="entry.type === 'points-missmatch'">-->
						<!--												Die Punktevergabe für Bewerber*in {{ candidateName(entry.candidateId) }} unterscheidet sich-->
						<!--												({{ entry.pointsA }} vs. {{ entry.pointsB }})-->
						<!--											</span>-->
						<!--									</li>-->
						<!--								</ul>-->
						<!--								<button class="button is-small is-danger">Dritte Zählung</button>-->
						<!--							</td>-->
						<!--						</tr>-->
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
