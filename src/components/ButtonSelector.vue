<script setup lang="ts">

import { computed } from "vue";

const model = defineModel<string | undefined>({ required: true });

const props = defineProps<{
	options: { [key: string]: string };
	styleClass?: string;
}>();

const emits = defineEmits<{
	(event: "change", value?: string): void
}>();

function buttonClasses(id: string) {
	if (model.value === id)
		return `button is-${props.styleClass || "primary"} is-selected`;
	else
		return "button";
}

function flipValue(id: string) {
	if (model.value === id)
		model.value = undefined;
	else
		model.value = id;

	emits("change", model.value);
}

</script>

<template>
	<div class="buttons has-addons">
		<button v-for="(name, id) in props.options"
				:class="buttonClasses(id as string)"
				@click="flipValue(id as string)">
			{{ name }}
		</button>
	</div>
</template>

<style scoped>

</style>