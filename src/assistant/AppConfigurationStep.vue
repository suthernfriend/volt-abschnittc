<script setup lang="ts">
import { type ElectionGeneral } from "@/lib/Types";
import FormField from "@/components/FormField.vue";
import TagsInput from "@/components/TagsInput.vue";
import { toParagraphs } from "@/lib/utility";
import type { AssistantProviderStep } from "@/lib/AssistantProvider";

const model = defineModel<ElectionGeneral>({ required: true });

const props = defineProps<{
	step: AssistantProviderStep;
}>();

const names: {
	[key in keyof Omit<ElectionGeneral, "ballotIds">]: {
		label: string;
		type: "string" | "array" | "object";
	}
} = {
	assemblyName: { label: "Name der Veranstaltung", type: "string" },
	electionName: { label: "Name der Wahl", type: "string" },
	associationName: { label: "Name des Verbands", type: "string" },
	electedOrgan: { label: "Zu wählendes Organ", type: "string" },
	lead: { label: "Leitung der Zählkommission", type: "string" },
	countingCommission: { label: "Mitglieder der Zählkommission", type: "array" }
};

</script>

<template>
	<div class="content" v-html="toParagraphs(props.step.explanation())" />
	<form-field v-for="(opts, key) in names" :label="opts.label">
		<input v-if="opts.type === 'string'" class="input" v-model="model[key]" />
		<tags-input v-if="opts.type === 'array'" v-model="model[key] as string[]" />
	</form-field>
</template>

<style scoped>

</style>