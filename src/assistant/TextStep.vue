<script setup lang="ts">

import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { toParagraphs } from "@/lib/utility";

const props = defineProps<{
	step: AssistantProviderStep;
}>();

</script>

<template>
	<div class="content" v-html="toParagraphs(props.step.explanation())" />
</template>

<style scoped>

</style>