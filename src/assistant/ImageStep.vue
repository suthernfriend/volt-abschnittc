<script setup lang="ts">

import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { toParagraphs } from "@/lib/utility";

const props = defineProps<{
	step: AssistantProviderStep;
	image: string;
}>();

</script>

<template>
	<div class="columns">
		<div class="column">
			<div class="content" v-html="toParagraphs(props.step.explanation())" />
		</div>
		<div class="column is-one-fifth">
			<img :src="props.image" :alt="props.step.title" />
		</div>
	</div>
</template>

<style scoped>

</style>