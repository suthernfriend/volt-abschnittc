<script setup lang="ts">

import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { toParagraphs } from "@/lib/utility";

const props = defineProps<{
	n: number;
	step: AssistantProviderStep;
}>();

</script>

<template>
	<div class="box">
		<h2 class="title is-3">Schritt {{ props.n }} - {{ props.step.title() }}</h2>
		<div class="content" v-html="toParagraphs(props.step.explanation())" />
	</div>
</template>

<style scoped>

</style>