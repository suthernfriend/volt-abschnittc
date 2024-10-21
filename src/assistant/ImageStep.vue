<script setup lang="ts">

import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { toParagraphs } from "@/lib/utility";

const props = defineProps<{
	n: number;
	step: AssistantProviderStep;
	image: string;
}>();

</script>

<template>
	<div class="box">
		<h2 class="title is-3">Schritt {{ props.n }} - {{ props.step.title() }}</h2>
		<div class="columns">
			<div class="column">
				<div class="content" v-html="toParagraphs(props.step.explanation())" />
			</div>
			<div class="column is-one-fifth">
				<img :src="props.image" :alt="props.step.title" />
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>