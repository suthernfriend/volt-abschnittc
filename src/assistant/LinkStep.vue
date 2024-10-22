<script setup lang="ts">

import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { toParagraphs } from "@/lib/utility";

const props = defineProps<{
	step: AssistantProviderStep;
	linkTitle: string;
}>();

const emits = defineEmits<{
	(event: "open"): void
}>();

</script>

<template>
	<div class="content" v-html="toParagraphs(props.step.explanation())" />
	<div class="buttons">
		<button class="button is-primary" @click="emits('open')">{{ linkTitle }}</button>
	</div>
</template>

<style scoped>

</style>