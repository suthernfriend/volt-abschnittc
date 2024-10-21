<script setup lang="ts">

import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { toParagraphs } from "@/lib/utility";

const props = defineProps<{
	n: number;
	step: AssistantProviderStep;
	linkTitle: string;
}>();

const emits = defineEmits<{
	(event: "open"): void
}>();

</script>

<template>
	<div class="box">
		<h2 class="title is-3">Schritt {{ props.n }} - {{ props.step.title() }}</h2>
		<div class="content" v-html="toParagraphs(props.step.explanation())" />
		<div class="buttons">
			<button class="button is-primary" @click="emits('open')">{{ linkTitle }}</button>
		</div>
	</div>
</template>

<style scoped>

</style>