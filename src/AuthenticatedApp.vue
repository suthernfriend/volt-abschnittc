<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { type AuthenticatedAppView, type Election } from "@/lib/Types";
import VoteInput from "@/views/VoteInput.vue";
import Ballot from "@/views/Ballot.vue";
import Candidates from "@/views/Candidates.vue";
import Introduction from "@/views/Introduction.vue";
import Export from "@/views/Export.vue";
import { v4 } from "uuid";
import { testCandidates, testCounts } from "@/test/TestData";
import { remoteReactive } from "@/lib/RemoteObject";
import { randomString } from "@/lib/utility";
import Assistant from "@/views/Assistant.vue";
import LotAndRunoff from "@/views/LotForPreliminaryLists.vue";
import RunoffView from "@/views/RunoffView.vue";
import PreliminaryView from "@/views/PreliminaryView.vue";

const props = defineProps<{
	remoteKey: string;
	name: string;
}>();

const assistantStep = ref<string>("app-configuration");

function testCounts2() {
	const votes = testCounts
		.male.map(value => {
			if (value.rankings.hasOwnProperty("2e34faee-5d30-4d2e-9461-4d0ab1046e28")) {
				value.rankings["9888cd11-f602-4fc8-afc6-37ffeb0333e4"] = value.rankings["2e34faee-5d30-4d2e-9461-4d0ab1046e28"];
				value.rankings["0ac6eaa1-1294-46fb-bc68-3886d116ca90"] = value.rankings["2e34faee-5d30-4d2e-9461-4d0ab1046e28"];
			} else {
				delete value.rankings["9888cd11-f602-4fc8-afc6-37ffeb0333e4"];
				delete value.rankings["0ac6eaa1-1294-46fb-bc68-3886d116ca90"];
			}
			return value;
		});

	return {
		male: votes,
		female: testCounts.female
	};
}

const tc2 = testCounts2();

const [election, dataStatus] = remoteReactive<Election>(props.remoteKey, {
	id: v4(),
	runoffs: [],
	candidates: [],
	lots: [],
	votes: [],
	general: {
		associationName: "Volt Saarland",
		electedOrgan: "21. Deutscher Bundestag",
		assemblyName: "Aufstellungsversammlung zur Wahl der Landesliste",
		ballotIds: {
			male: randomString(8),
			female: randomString(8),
			"242": randomString(8)
		},
		countingCommission: [],
		lead: "Sebastian Gerhard",
		electionName: "Wahl der Landesliste für die Wahl zum 21. Deutschen Bundestag für Volt im Land Saarland"
	}
} satisfies Election);
/*
	votes: [...tc2.female, ...tc2.male],
	general: {
		lead: "Leitung der Zählkommission",
		electedOrgan: "Organ",
		associationName: "Verband",
		assemblyName: "Name der Veranstaltung",
		electionName: "Name der Wahl",
		ballotIds: {
			male: randomString(8),
			female: randomString(8),
			"242": randomString(8)
		},
		countingCommission: []
	},
	candidates: [...testCandidates],
	runoffs: [],
	lots: [],
	id: v4()
});
 */

const view = ref<AuthenticatedAppView>("assistant");


function setView(newView: AuthenticatedAppView): void {
	view.value = newView;
}

function eqActive(viewName: AuthenticatedAppView): () => string {
	return () => (view.value === viewName ? "is-active" : "");
}

const menuItems: { view: AuthenticatedAppView; title: string; classes(): string }[] = [
	{ view: "assistant", title: "Assistent", classes: eqActive("assistant") },
	{ view: "candidates", title: "Bewerber", classes: eqActive("candidates") },
	{ view: "ballot", title: "Stimmzettel", classes: eqActive("ballot") },
	{ view: "vote-input", title: "Eingabe", classes: eqActive("vote-input") },
	{ view: "preliminary", title: "1. Wahlgang", classes: eqActive("preliminary") },
	{ view: "runoff", title: "2. Wahlgang", classes: eqActive("runoff") },
	{ view: "export", title: "Ergebniszettel", classes: eqActive("export") },
	{ view: "introduction", title: "Einführung / Anleitung", classes: eqActive("introduction") }
];

const ready = computed(() => {
	return dataStatus.value.ready;
});

</script>

<template>
	<nav v-if="ready">
		<div class="tabs is-centered">
			<ul>
				<li v-for="v in menuItems" :class="v.classes()">
					<a @click="setView(v.view)">{{ v.title }}</a>
				</li>
			</ul>
		</div>
	</nav>

	<main v-if="ready && election">
		<assistant v-if="view === 'assistant'" @open="view => setView(view)" v-model:election="election"
				   v-model:step="assistantStep" />
		<candidates v-if="view === 'candidates'" v-model="election" />
		<ballot v-if="view === 'ballot'" v-model="election" />
		<vote-input v-if="view === 'vote-input'" v-model="election" />
		<export v-if="view === 'export'" v-model="election" />
		<preliminary-view v-if="view === 'preliminary'" v-model="election" />
		<runoff-view v-if="view === 'runoff'" v-model="election" />
		<introduction v-if="view === 'introduction'" />
	</main>
	<footer class="my-5">
		<div class="container">
			<span>Alle Rechte vorbehalten. &copy; 2024 Jan Peter König</span>
		</div>
	</footer>
</template>

<style scoped></style>
