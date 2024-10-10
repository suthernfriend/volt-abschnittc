<script setup lang="ts">

import { type Election, renderCandidateName, sortCandidates } from "@/lib/Types";
import { computed, ref } from "vue";
import VoteCreate from "@/views/VoteCreate.vue";

const election = defineModel<Election>({ required: true });
type ViewType = "input-md" | "input-wd" | "start";
const view = ref<ViewType>("start");

function setView(newView: ViewType) {
	view.value = newView;
}

const counts = computed<{
	maleFirst: number,
	maleSecond: number,
	femaleFirst: number,
	femaleSecond: number
}>(() => {
	const counts = election.value.counts;
	const seenMale: string[] = [], seenFemale: string[] = [];
	const twiceMale: string[] = [], twiceFemale: string[] = [];

	for (const count of counts.male) {
		if (seenMale.includes(count.ballotId)) {
			twiceMale.push(count.ballotId);
		} else {
			seenMale.push(count.ballotId);
		}
	}

	for (const count of counts.female) {
		if (seenFemale.includes(count.ballotId)) {
			twiceFemale.push(count.ballotId);
		} else {
			seenFemale.push(count.ballotId);
		}
	}

	return {
		maleFirst: seenMale.length,
		maleSecond: twiceMale.length,
		femaleFirst: seenFemale.length,
		femaleSecond: twiceFemale.length
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
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>