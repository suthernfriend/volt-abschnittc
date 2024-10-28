<script setup lang="ts">

import ResultTable from "@/components/ResultTable.vue";
import { type Election, ElectionGenders, electionGenderString, type ElectionLotResult } from "@/lib/Types";
import { computed, onMounted, ref } from "vue";
import Container from "@/lib/Container";
import LotInterface from "@/components/LotInterface.vue";
import { arraySameContents } from "@/lib/utility";

import type { EvaluationResult } from "@/lib/EvaluationResult";

const model = defineModel<Election>({
	required: true
});

const result = ref<EvaluationResult>();

onMounted(async () => {
	await reevaluate();
});

async function reevaluate() {
	const voteEvaluator = await Container.voteEvaluator();
	result.value = voteEvaluator.evaluate(model.value);
	lotInterfaces.value = createLotInterfaces();
}

const showLotInterface = computed(() => {
	if (result.value?.type === "need-lot") {
		return true;
	} else if (model.value.lots.length > 0) {
		return true;
	} else {
		return false;
	}
});

function createLotInterfaces() {
	if (!result.value) return [];

	const previous = model.value.lots;

	if (result.value?.type === "need-lot") {
		// check if we need to add a new lot
		for (const lot of previous) {
			if (arraySameContents(lot.candidates, result.value.candidates))
				return previous;
		}

		return [...previous, {
			winner: undefined,
			candidates: [
				...result.value.candidates
			]
		}];
	} else {
		return previous;
	}
}

const lotInterfaces = ref<ElectionLotResult[]>([]);

async function updateLot(n: number) {
	const winner = lotInterfaces.value[n].winner;
	const candidates = lotInterfaces.value[n].candidates;
	console.log(`Updating lot ${n} with ${winner}`);

	if (!model.value.lots[n])
		model.value.lots[n] = { winner, candidates: [...candidates] };
	else
		model.value.lots[n].winner = winner;

	await reevaluate();
}

async function removeLot(n: number) {
	model.value.lots.splice(n, 1);

	await reevaluate();
}

</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Ergebnisse des 1. Wahlgangs</h2>
		</div>
		<div class="columns">
			<div class="column" v-if="showLotInterface">
				<div class="box" v-for="(lot, i) in lotInterfaces">
					<lot-interface :n="i"
								   :lot-candidates="lot.candidates"
								   :all-candidates="model.candidates"
								   v-model="lotInterfaces[i].winner"
								   @change="updateLot(i)"
					/>
					<button @click="removeLot(i)" class="button is-primary">R</button>
				</div>
			</div>
		</div>
		<div class="columns" v-if="result?.type === 'need-runoff'">
			<div class="column" v-for="gender in ElectionGenders">
				<div class="box">
					<result-table
						:title="electionGenderString(gender)"
						:result="result.preliminaryLists[gender]"
						:candidates="model.candidates" />
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>
