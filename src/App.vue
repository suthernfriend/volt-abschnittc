<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { type Election } from "@/lib/Types";
import Overview from "@/views/Overview.vue";
import VoteInput from "@/views/VoteInput.vue";
import Ballot from "@/views/Ballot.vue";
import Candidates from "@/views/Candidates.vue";
import Introduction from "@/views/Introduction.vue";
import Export from "@/views/Export.vue";
import { v4 } from "uuid";
import { testCandidates, testCounts } from "@/test/TestData";
import AuthFence from "@/AuthFence.vue";
import Container from "@/lib/Container";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { remoteReactive } from "@/lib/RemoteObject";
import { randomString } from "@/lib/utility";

const [election, dataStatus] = remoteReactive<Election>("volt-abschnittc-election-4", {
	counts: {
		female: [...testCounts.female],
		male: [...testCounts.male],
	},
	general: {
		lead: "",
		assemblyName: "Name der Veranstaltung",
		electionName: "Name der Wahl",
		ballotIds: {
			male: randomString(8),
			female: randomString(8),
			"242": randomString(8),
		},
		countingCommission: [],
	},
	candidates: [...testCandidates],
	runoffWinner: "none",
	id: v4(),
});
const view = ref<View>("overview");

type View = "overview" | "candidates" | "ballot" | "vote-input" | "export" | "introduction";

function setView(newView: View): void {
	view.value = newView;
}

function eqActive(viewName: View): () => string {
	return () => (view.value === viewName ? "is-active" : "");
}

const menuItems: { view: View; title: string; classes(): string }[] = [
	{ view: "overview", title: "Übersicht", classes: eqActive("overview") },
	{ view: "candidates", title: "Bewerber", classes: eqActive("candidates") },
	{ view: "ballot", title: "Stimmzettel", classes: eqActive("ballot") },
	{ view: "vote-input", title: "Eingabe", classes: eqActive("vote-input") },
	{ view: "export", title: "Ergebniszettel", classes: eqActive("export") },
	{ view: "introduction", title: "Einführung / Anleitung", classes: eqActive("introduction") },
];

const clientId = "612877073998-0nn7h87htlg1f76es2m2f3mr3lgglgsg.apps.googleusercontent.com";
const hd = "volteuropa.org";

const auth = ref<null | { name: string }>(null);

onMounted(() => {
	Container.authManager()
		.then(value => {
			if (value.isAuthenticated()) auth.value = { name: value.payload().name };
		})
});

async function useCredential(cred: string) {
	const authManager = await Container.authManager()
	await authManager.useCredential(cred);
	const payload = authManager.payload();
	console.log(payload);
	auth.value = { name: payload.name };
}

async function clearAuth() {
	const authManager = await Container.authManager()
	authManager.clear();
	auth.value = null;
}

const ready = computed(() => {
	return auth.value !== null && dataStatus.value.ready;
});
</script>

<template>
	<nav class="navbar is-dark">
		<div class="container">
			<div class="navbar-brand">
				<a class="navbar-item" href="/">
					<img src="./assets/logo.png" alt="Volt Logo" />
				</a>
				<h1 class="navbar-item">
					Abschnitt C - Auszählungstool für das Verfahren zur Aufstellung von Kandidierenden zu staatlichen Wahlen bei Volt
				</h1>
			</div>
			<div v-if="auth" class="navbar-end">
				<div class="navbar-item">
					{{ auth.name }}
				</div>
				<div class="navbar-item">
					<button @click="clearAuth" class="button is-danger">
						<font-awesome-icon :icon="faSignOutAlt" />
					</button>
				</div>
			</div>
		</div>
	</nav>
	<auth-fence v-if="auth === null" :domain="hd" :client-id="clientId" @credential="useCredential" />
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
					Die Nutzung dieser Software erfordert eine Lizenz. Bitte kontaktiere
					<a href="mailto:janpeter.koenig@volteuropa.org">mich</a>
					bevor du die Software nutzt.
				</div>
			</div>
		</div>
	</footer>
</template>

<style scoped></style>
