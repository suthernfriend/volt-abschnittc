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
	const candidate = election.value.candidates.find(c => c.id === id);
	if (!candidate)
		return "Unbekannt";
	return renderCandidateName(candidate);
}

const missingBallots = computed<string[]>(() => {
	const out: string[] = [];

	for (const ballotId of maleSeen.value)
		if (!maleTwice.value.includes(ballotId))
			out.push(ballotId);
	for (const ballotId of femaleSeen.value)
		if (!femaleTwice.value.includes(ballotId))
			out.push(ballotId);

	return out;
});


type MissingBallotsType = { [ballotId: string]: { counts: Vote[] } };

const missmatchedBallots = computed<MissingBallotsType>(() => {
	const out: MissingBallotsType = {};
	const twiceBallot = [...maleTwice.value, ...femaleTwice.value];

	for (const ballotId of twiceBallot) {
		const ballots = election.value.counts.male.filter(c => c.ballotId === ballotId);
		ballots.push(...election.value.counts.female.filter(c => c.ballotId === ballotId));

		if (ballots.length !== 2 || !voteEquals(ballots[0], ballots[1]))
			out[ballotId] = { counts: ballots };
	}

	return out;
});

type BallotCountsType = { [ballotId: string]: number };

const ballotCounts = computed<BallotCountsType>(() => {
	const out: BallotCountsType = {};
	for (const count of election.value.counts.male)
		out[count.ballotId] = (out[count.ballotId] || 0) + 1;
	for (const count of election.value.counts.female)
		out[count.ballotId] = (out[count.ballotId] || 0) + 1;
	return out;
});

const maleSeen = computed<string[]>(() => {
	const out: string[] = [];
	for (const count of election.value.counts.male) {
		if (ballotCounts.value.hasOwnProperty(count.ballotId))
			out.push(count.ballotId);
	}
	return [...new Set(out)];
});

const femaleSeen = computed<string[]>(() => {
	const out: string[] = [];
	for (const count of election.value.counts.female) {
		if (ballotCounts.value.hasOwnProperty(count.ballotId))
			out.push(count.ballotId);
	}
	return [...new Set(out)];
});

const maleTwice = computed<string[]>(() => {
	const out: string[] = [];
	for (const count of election.value.counts.male) {
		if (ballotCounts.value.hasOwnProperty(count.ballotId) && ballotCounts.value[count.ballotId] > 1)
			out.push(count.ballotId);
	}

	return [...new Set(out)];
});


const femaleTwice = computed<string[]>(() => {
	const out: string[] = [];
	for (const count of election.value.counts.female) {
		if (ballotCounts.value.hasOwnProperty(count.ballotId) && ballotCounts.value[count.ballotId] > 1)
			out.push(count.ballotId);
	}
	return [...new Set(out)];
});

const counts = computed<{
	maleFirst: number,
	maleSecond: number,
	femaleFirst: number,
	femaleSecond: number
}>(() => {
	return {
		maleFirst: maleSeen.value.length,
		maleSecond: maleTwice.value.length,
		femaleFirst: femaleSeen.value.length,
		femaleSecond: femaleTwice.value.length
	};
});

</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Stimmeingabe</h2>
		</div>
		<div class="columns" v-if="view === 'input-md'">
			<div class="column">
				<vote-create :candidates="election.candidates" />
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
						<div>Einfach männlich / divers: {{ counts.maleFirst }}</div>
						<div>Einfach weiblich / divers: {{ counts.femaleFirst }}</div>
						<div>Zweifach männlich / divers: {{ counts.maleSecond }}</div>
						<div>Zweifach weiblich / divers: {{ counts.femaleSecond }}</div>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="box">
					<h3 class="title is-4">Kontrolle</h3>
					<div v-if="Object.keys(missmatchedBallots).length === 0"  class="block">
						Keine Fehler gefunden!
					</div>
					<table v-else class="table is-fullwidth is-striped">
						<thead>
						<tr>
							<th>Stimmzettel-Nr.</th>
							<th>Beschreibung</th>
						</tr>
						</thead>
						<tbody>
						<tr v-for="(ballot, id) in missmatchedBallots">
							<td>{{ id }}</td>
							<td>
								<ul>
									<li v-for="entry in voteDiff(ballot.counts[0], ballot.counts[1])">
										<span v-if="entry.type === 'missing-candidate'">
											Bewerber*in {{ candidateName(entry.candidateId) }} fehlt in der Zählung von Stimmzettel {{ id }}
										</span>
										<span v-else-if="entry.type === 'points-missmatch'">
											Die Punktevergabe für Bewerber*in {{ candidateName(entry.candidateId) }} unterscheidet sich ({{ entry.pointsA }} vs. {{ entry.pointsB }})
										</span>
									</li>
								</ul>

							</td>
						</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>