<script setup lang="ts">

import ResultTable from "@/components/ResultTable.vue";
import { type Election, ElectionGenders, electionGenderString } from "@/lib/Types";
import { onMounted, ref } from "vue";
import type { Result } from "@/lib/Evaluation";
import Container from "@/lib/Container";

const model = defineModel<Election>({
	required: true
});

const result = ref<Result>();

onMounted(async () => {
	const voteEvaluator = await Container.voteEvaluator();
	result.value = voteEvaluator.evaluate(model.value);
});

</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Ergebnisse des 1. Wahlgangs</h2>
		</div>
		<div class="columns" v-if="result">
			<div class="column" v-for="gender in ElectionGenders">
				<result-table
					:title="electionGenderString(gender)"
					:result="result.preliminaryLists[gender]"
					:candidates="model.candidates" />
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>