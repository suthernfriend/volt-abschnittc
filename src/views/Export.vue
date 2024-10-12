<script setup lang="ts">
import type { Election } from "@/lib/Types";
import ResultDisplay from "@/views/ResultDisplay.vue";

const election = defineModel<Election>({ required: true });

function downloadPdf() {

}

function copyMinutesText() {

}

</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Auswertung</h2>
		</div>
		<div class="columns">
			<div class="column is-two-thirds">
				<result-display v-model="election" />
			</div>
			<div class="column">
				<div class="box">
					<div class="block">

					</div>
					<div class="block">
						<h3>Ergebniszettel und Dokumentation</h3>
						<div class="buttons">
							<div @click="downloadPdf" class="button is-primary">PDF herunterladen</div>
							<div @click="copyMinutesText" class="button is-info">Text für Protokoll kopieren</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>