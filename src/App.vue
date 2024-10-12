<script setup lang="ts">

import { ref } from "vue";
import { type Election, renderCandidateName } from "@/lib/Types";
import Overview from "@/views/Overview.vue";
import VoteInput from "@/views/VoteInput.vue";
import Ballot from "@/views/Ballot.vue";
import Candidates from "@/views/Candidates.vue";
import Introduction from "@/views/Introduction.vue";
import Export from "@/views/Export.vue";
import { v4 } from "uuid";
import { testCandidates, testCounts } from "@/test/TestData";

const election = ref<Election>({
	counts: {
		female: [...testCounts.female],
		male: [...testCounts.male]
	},
	candidates: [...testCandidates],
	countingCommission: [],
	lead: "",
	id: v4()
});
const view = ref<View>("overview");

type View = "overview" | "candidates" | "ballot" | "vote-input" | "export" | "introduction";

function setView(newView: View): void {
	view.value = newView;
}

function eqActive(viewName: View): () => string {
	return () => view.value === viewName ? "is-active" : "";
}

const menuItems: { view: View, title: string, classes(): string }[] = [
	{ view: "overview", title: "Übersicht", classes: eqActive("overview") },
	{ view: "candidates", title: "Bewerber", classes: eqActive("candidates") },
	{ view: "ballot", title: "Stimmzettel", classes: eqActive("ballot") },
	{ view: "vote-input", title: "Eingabe", classes: eqActive("vote-input") },
	{ view: "export", title: "Ergebniszettel", classes: eqActive("export") },
	{ view: "introduction", title: "Einführung / Anleitung", classes: eqActive("introduction") }
];

</script>

<template>
	<nav class="navbar is-dark">
		<div class="container">
			<div class="navbar-brand">
				<a class="navbar-item" href="/">
					<img src="./assets/logo.png" alt="Volt Logo">
				</a>
				<h1 class="navbar-item">Abschnitt C - Auszählungstool für das Verfahren zur Aufstellung von
					Kandidierenden zu staatlichen Wahlen bei Volt</h1>
			</div>
		</div>
	</nav>
	<nav>
		<div class="tabs is-centered">
			<ul>
				<li v-for="v in menuItems" :class="v.classes()">
					<a @click="setView(v.view)">{{ v.title }}</a>
				</li>
			</ul>
		</div>
	</nav>
	<main>
		<overview v-if="view === 'overview'" v-model="election" />
		<candidates v-if="view === 'candidates'" v-model="election" />
		<ballot v-if="view === 'ballot'" v-model="election" />
		<vote-input v-if="view === 'vote-input'" v-model="election" />
		<export v-if="view === 'export'" v-model="election" />
		<introduction v-if="view === 'introduction'" />
	</main>
	<footer>
		<div class="container">
			<div class="message is-danger mt-4">
				<div class="message-body">
					<strong>Achtung!</strong>
					Die Nutzung dieser Software erfordert eine Lizenz. Bitte kontaktiere <a
					href="mailto:janpeter.koenig@volteuropa.org">mich</a>
					bevor du die Software nutzt.
				</div>
			</div>
		</div>
	</footer>
</template>

<style scoped>
</style>
