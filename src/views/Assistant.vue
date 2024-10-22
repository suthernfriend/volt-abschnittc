<script setup lang="ts">

import TitleBlock from "@/components/TitleBlock.vue";
import { computed, onMounted, ref } from "vue";
import type { AssistantProviderStep } from "@/lib/AssistantProvider";
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
import NeedLotStep from "@/assistant/NeedLotStep.vue";
import PrintBallots2Step from "@/assistant/PrintBallots2Step.vue";
import CommitCandidates2Step from "@/assistant/CommitCandidates2Step.vue";

const model = defineModel<Election>("election", { required: true });
const currentRef = defineModel<string>("step", { required: true });

const emit = defineEmits<{
	(event: "open", view: AuthenticatedAppView): void;
}>();

const stepOrder = ref<string[]>();
const stepRefs = ref<{ [name: string]: AssistantProviderStep }>({});
const current = computed(() => {
	if (!currentRef.value)
		return undefined;
	return stepRefs.value[currentRef.value];
});

const ix = computed(() => {
	if (!stepOrder.value || !current.value)
		return 0;
	return stepOrder.value.indexOf(currentRef.value);
});

const stepCount = computed(() => {
	return Object.keys(stepRefs.value).length;
});

onMounted(async () => {
	const assistantProvider = await Container.assistantProvider();
	stepOrder.value = assistantProvider.getSteps();

	for (const step of stepOrder.value) {
		stepRefs.value[step] = assistantProvider.getStep(step);
	}
});

function isCurrentStep(name: string) {
	return currentRef.value === name;
}

function select(i: number) {
	if (!stepOrder.value || i < 0 || i >= stepOrder.value.length)
		return;
	currentRef.value = stepOrder.value[i];
}

</script>

<template>
	<div class="container" v-if="current">
		<title-block :size="2">Abstimmungsassistent</title-block>
		<pagination :current="ix + 1" :steps="stepCount" @step-selected="(i) => select(i - 1)" />
		<div class="block">
			<div class="box">
				<h2 class="title is-3">Schritt {{ ix + 1 }} - {{ current.title() }}</h2>
				<app-configuration
					v-if="isCurrentStep('app-configuration')"
					:step="current"
					v-model="model.general" />
				<link-step
					v-else-if="isCurrentStep('link-step-candidates-import')"
					:step="current"
					link-title="Bewerber-Tab öffnen"
					@open="emit('open', 'candidates')" />
				<candidates-double-check
					v-else-if="isCurrentStep('candidates-double-check')"
					:step="current"
					:candidates="model.candidates" />
				<link-step
					link-title="Stimmzettel-Tab öffnen"
					v-else-if="isCurrentStep('link-print-ballots')"
					:step="current"
					@open="emit('open', 'ballot')" />
				<text-step
					v-if="isCurrentStep('execute-vote')"
					:step="current" />
				<image-step
					v-if="isCurrentStep('numbering-ballots')"
					:image="NumberingBallots"
					:step="current" />
				<link-step
					v-if="isCurrentStep('input-ballots')"
					link-title="Zum Eingabe-Tab"
					:step="current"
					@open="emit('open', 'vote-input')" />
				<control-input-step
					:votes="model.votes"
					v-if="isCurrentStep('control-input')"
					:step="current" />
				<need-lot-step
					v-if="isCurrentStep('lot')"
					:election="model"
					link-title="Zum 1. Wahlgang-Tab"
					:step="current"
					@open="emit('open', 'preliminary')" />
				<link-step
					v-if="isCurrentStep('commit-result')"
					link-title="Zum 1. Wahlgang-Tab"
					:step="current"
					@open="emit('open', 'preliminary')" />
				<link-step
					v-if="isCurrentStep('display-result')"
					link-title="Zum 1. Wahlgang-Tab"
					:step="current"
					@open="emit('open', 'preliminary')" />
				<CommitCandidates2Step
					v-if="isCurrentStep('commit-candidates-2')"
					:step="current"
					:election="model" />
				<PrintBallots2Step
					v-if="isCurrentStep('print-ballots-2')"
					:step="current"
					@open="emit('open', 'ballot')"
					:election="model" />
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>