<script setup lang="ts">

import TitleBlock from "@/components/TitleBlock.vue";
import { computed, onMounted, ref } from "vue";
import type { AssistantProviderStep, AssistantProviderStepType } from "@/lib/AssistantProvider";
import Container from "@/lib/Container";
import AppConfiguration from "@/assistant/AppConfigurationStep.vue";
import { type AuthenticatedAppView, type Election } from "@/lib/Types";
import LinkStep from "@/assistant/LinkStep.vue";
import Pagination from "@/components/Pagination.vue";
import CandidatesDoubleCheck from "@/assistant/CandidatesDoubleCheck.vue";

import NumberingBallots from "@/assets/assistant/numbering-ballots.webp";
import TextStep from "@/assistant/TextStep.vue";
import ImageStep from "@/assistant/ImageStep.vue";
import ControlInputStep from "@/assistant/ControlInputStep.vue";

const model = defineModel<Election>("election", { required: true });
const current = defineModel<number>("step", { required: true });

const emit = defineEmits<{
	(event: "open", view: AuthenticatedAppView): void;
}>();

const steps = ref<AssistantProviderStep[]>([]);

onMounted(async () => {
	const assistantProvider = await Container.assistantProvider();
	steps.value = assistantProvider.getSteps();
});

function setStep(n: number) {
	current.value = n;
}

const currentStep = computed(() => steps.value?.[current.value - 1]);

function isCurrentStep(type: AssistantProviderStepType) {
	return currentStep.value?.type() === type;
}

const currentTitle = computed(() => currentStep.value?.title() || "");

const currentExplanation = computed(() => currentStep.value?.explanation() || "");


</script>

<template>
	<div class="container">
		<title-block :size="2">Abstimmungsassistent</title-block>
		<pagination :current="current" :steps="steps.length" @step-selected="step => current = step" />
		<div class="block" v-if="steps[current]">
			<app-configuration
				v-if="isCurrentStep('app-configuration')"
				:step="currentStep"
				:n="current"
				v-model="model.general" />
			<link-step
				v-else-if="isCurrentStep('link-step-candidates-import')"
				:step="currentStep"
				:n="current"
				link-title="Bewerber-Tab öffnen"
				@open="emit('open', 'candidates')" />
			<candidates-double-check
				v-else-if="isCurrentStep('candidates-double-check')"
				:step="currentStep"
				:n="current"
				:candidates="model.candidates" />
			<link-step link-title="Stimmzettel-Tab öffnen"
					   v-else-if="isCurrentStep('link-print-ballots')"
					   :step="currentStep"
					   :n="current"
					   @open="emit('open', 'ballot')" />
			<text-step v-if="isCurrentStep('execute-vote')"
					   :n="current"
					   :step="currentStep" />
			<image-step v-if="isCurrentStep('numbering-ballots')"
						:n="current"
						:image="NumberingBallots"
						:step="currentStep" />
			<link-step v-if="isCurrentStep('input-ballots')"
					   link-title="Zum Eingabe-Tab"
					   :step="currentStep" :n="current"
					   @open="emit('open', 'vote-input')" />
			<control-input-step
				:votes="model.votes"
				v-if="isCurrentStep('control-input')"
				:step="currentStep" :n="current" />
			<link-step v-if="isCurrentStep('commit-result')"
					   link-title="Zum Ergebnis-Tab"
					   :step="currentStep" :n="current"
					   @open="emit('open', 'export')" />
			<link-step v-if="isCurrentStep('display-result')"
					   link-title="Zum Ergebnis-Tab"
					   :step="currentStep" :n="current"
					   @open="emit('open', 'export')" />
			<link-step v-if="isCurrentStep('lot')"
					   link-title="Zum Ergebnis-Tab"
					   :step="currentStep" :n="current"
					   @open="emit('open', 'export')" />
		</div>
	</div>
</template>

<style scoped>

</style>