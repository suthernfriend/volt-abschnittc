<script setup lang="ts">

import { type ElectionCandidate, renderCandidateName } from "@/lib/Types";
import { computed } from "vue";
import ButtonSelector from "@/components/ButtonSelector.vue";

const model = defineModel<string | undefined>({ required: true });

const emits = defineEmits<{
	(event: "change", value?: string): void
}>();

const props = defineProps<{
	n: number;
	allCandidates: ElectionCandidate[];
	lotCandidates: string[];
}>();

const candidateNames = computed(() => {
	return props.lotCandidates
		.map(id => props.allCandidates.find(c => c.id === id)!)
		.map(renderCandidateName);
});

const options = computed(() => {
	return Object.fromEntries(
		props.lotCandidates.map(id => {
			return [id, renderCandidateName(props.allCandidates.find(c => c.id === id)!)];
		})
	);
});



</script>

<template>
	<div class="block">
		<h2 class="title is-4">Losverfahren #{{ n + 1 }}</h2>
		<div class="content">
			<div>
				Die Bewerber*innen {{ candidateNames.join(" und ") }} haben die gleichen Stimmen erhalten.
			</div>
			<div>
				Es ist ein Losverfahren erforderlich.
			</div>
			<div>
				{{ model }}
			</div>
		</div>
		<button-selector style-class="primary"
						 @change="emits('change', model)"
						 :options="options" v-model="model" />
	</div>
</template>

<style scoped>

</style>