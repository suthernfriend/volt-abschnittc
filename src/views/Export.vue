<script setup lang="ts">
import type { Election } from "@/lib/Types";
import ResultDisplay from "@/views/ResultDisplay.vue";
import { BallotGeneratorImpl } from "@/lib/BallotGeneratorImpl";
import { computed, onMounted, ref } from "vue";
import { Evaluation } from "@/lib/Evaluation";
import { downloadFile } from "@/lib/utility";
import Container from "@/lib/Container";

import type { EvaluationResult } from "@/lib/EvaluationResult";

const model = defineModel<Election>({ required: true });

const result = ref<EvaluationResult>();

onMounted(async () => {
	const evaluator = await Container.voteEvaluator();
	result.value = evaluator.evaluate(model.value);
});

async function downloadPdf() {
	if (result.value?.type !== "list-complete") {
		alert("Ergebnis ist nicht vollständig.");
		return;
	}

	const ballotGenerator = await Container.ballotGenerator();

	const ballot = await ballotGenerator.resultComplete({
		candidates: model.value.candidates,
		assemblyName: model.value.general.assemblyName,
		electionName: model.value.general.electionName,
		result: result.value,
		uniqueIds: model.value.general.ballotIds
	});

	const url = URL.createObjectURL(new Blob([ballot], { type: "application/pdf" }));

	const filePrefix = model.value.general.electionName.replace(/\s+/g, "_");
	downloadFile(url, `${filePrefix}_Ergebnis.pdf`);
}

function copyMinutesText() {
}
</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Auswertung</h2>
		</div>
		<div class="columns" v-if="result">
			<div class="column is-two-thirds">
				<result-display :result="result" v-model="model" />
			</div>
			<div class="column">
				<div class="box">
					<h3 class="title is-4">Ergebniszettel und Dokumentation</h3>
					<div class="block">
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

<style scoped></style>
