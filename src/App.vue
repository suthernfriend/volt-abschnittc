<script setup lang="ts">

import { onMounted, ref } from "vue";
import AuthenticatedApp from "@/AuthenticatedApp.vue";
import AuthFence from "@/AuthFence.vue";
import Container from "@/lib/Container";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import FormField from "@/components/FormField.vue";

const auth = ref<{ name: string } | null>(null);
const remoteKey = ref<string>("av-rlp-ltw-25-9");
const accepted = ref<boolean>(true);

const clientId = "612877073998-0nn7h87htlg1f76es2m2f3mr3lgglgsg.apps.googleusercontent.com";
const hd = "volteuropa.org";

async function useCredential(cred: string) {
	const authManager = await Container.authManager();
	await authManager.useCredential(cred);
	const payload = authManager.payload();
	console.log(payload);
	auth.value = { name: payload.name };
}

async function clearAuth() {
	const authManager = await Container.authManager();
	authManager.clear();
	auth.value = null;
}

onMounted(() => {
	Container.authManager()
		.then(value => {
			if (value.isAuthenticated()) auth.value = { name: value.payload().name };
		});
});

function acceptAndContinue() {
	accepted.value = true;
}

function isReady() {
	return auth.value !== null && remoteKey.value !== "" && accepted.value;
}

</script>

<template>
	<nav class="navbar is-dark">
		<div class="container">
			<div class="navbar-brand">
				<a class="navbar-item" href="/">
					<img src="./assets/logo.png" alt="Volt Logo" />
				</a>
				<h1 class="navbar-item">
					Abschnitt C - Auszählungstool für das Verfahren zur Aufstellung von Kandidierenden zu staatlichen
					Wahlen bei Volt
				</h1>
			</div>
			<div class="navbar-end">
				<div class="navbar-item" v-if="auth">
					{{ auth.name }}
				</div>
				<div class="navbar-item" v-if="auth">
					<button @click="clearAuth" class="button is-danger">
						<font-awesome-icon :icon="faSignOutAlt" />
					</button>
				</div>
			</div>
		</div>
	</nav>
	<div class="container mt-5" v-if="!isReady()">
		<article class="message is-info">
			<div class="message-body">
				<h1 class="title is-3">Nutzungshinweise</h1>
				<div class="content">
					<p>
						Liebe Volt-Mitglieder und Wahlverantwortliche,
					</p>
					<p>
						ich möchte euch über die Nutzungsbedingungen unseres Auszählungstools "Abschnitt C" informieren.
						Dieses
						Tool
						wurde speziell für das Verfahren zur Aufstellung von Kandidierenden zu staatlichen Wahlen bei
						Volt
						entwickelt.
					</p>
					<p>
						Für die Nutzung von "Abschnitt C" wird eine Schutzgebühr von 40,00 € netto pro Wahlvorgang
						erhoben.
						Diese
						Gebühr dient dazu, die Serverkosten zu decken sowie die kontinuierliche Wartung, Fehlerbehebung
						und den
						Support des Tools zu gewährleisten. Als alleiniger Entwickler bin ich, Jan Peter König
						(janpeter.koenig@volteuropa.org), für diese Aufgaben verantwortlich.
					</p>
					<p>
						Die Abrechnung erfolgt direkt mit dem Verband, der die Versammlung ausrichtet, in der die Wahl
						stattfindet.
						Nach der erfolgreichen Durchführung der Wahl wird eine Rechnung an den entsprechenden Verband
						gestellt.
						Wichtig zu wissen ist, dass die Gebühr nur dann fällig wird, wenn die Auszählung mit "Abschnitt
						C"
						erfolgreich durchgeführt werden konnte. Sollten technische Probleme oder andere Hindernisse
						auftreten,
						die
						eine Nutzung des Tools verhindern, entfällt die Gebühr selbstverständlich.
					</p>
					<p>
						Die Erhebung dieser Gebühr ist notwendig, um die Qualität und Zuverlässigkeit von "Abschnitt C"
						langfristig
						sicherzustellen. Sie ermöglicht es mir, zeitnah auf Fehlermeldungen zu reagieren, das Tool an
						sich
						ändernde
						Anforderungen anzupassen und euch bei Fragen oder Problemen zur Seite zu stehen. Zudem tragen
						die
						Einnahmen
						dazu bei, die technische Infrastruktur zu finanzieren, die für den reibungslosen Betrieb des
						Tools
						erforderlich ist.
					</p>
					<p>
						Ich hoffe, dass ihr Verständnis für diese Regelung habt und freue mich darauf, euch mit
						"Abschnitt C"
						bei euren Wahlen zu unterstützen. Bei Fragen zur Nutzung oder Abrechnung stehe ich euch
						jederzeit gerne
						zur
						Verfügung.
					</p>
					<p>
						Mit der Nutzung dieser Software erklärst du dich mit diesen Nutzungsbedingungen einverstanden
						und
						versicherst, dass du von deinem Verband die Ermächtigung besitzt diese Software zu nutzen.
					</p>
					<p>
						Beste Grüße,
						Jan Peter König
					</p>
				</div>
			</div>
		</article>
		<div class="box" v-if="auth">
			<h2 class="title is-4">Getting started</h2>
			<form-field label="Eindeutige Kennung">
				<input class="input" type="text"
					   placeholder="Ein eindeutiger Schlüssel für die Versammlung (z.B. 'av-rlp-2405')"
					   v-model="remoteKey" />
			</form-field>
			<button class="button is-danger" @click="acceptAndContinue">Nutzungsbedingungen akzeptieren und ggf.
				Zahlungspflichtig bestellen
			</button>
		</div>
	</div>
	<auth-fence v-if="auth === null" :domain="hd" :client-id="clientId" @credential="useCredential" />
	<authenticated-app v-if="isReady() && auth" :name="auth.name" :remote-key="remoteKey" />
	<div style="min-height: 20vh" v-if="!isReady()"></div>
</template>

<style scoped>

</style>