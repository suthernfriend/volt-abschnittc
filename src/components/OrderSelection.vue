<script setup lang="ts">

import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { computed } from "vue";

const model = defineModel<string[]>({
	required: true
});

const props = defineProps<{
	options: { [key: string]: string };
}>();

const notSelected = computed(() => {
	return Object.keys(props.options)
		.filter(key => !model.value.includes(key));
});

function addValue(id: string) {
	model.value.push(id);
}

function removeValue(id: string) {
	model.value.splice(model.value.indexOf(id), 1);
}

</script>

<template>
	<div class="order-select">
		<div class="selected">
			<h4>Bereits geordnete Bewerber</h4>
			<!-- already chosen options -->
			<div v-for="(option, i) in model" :key="option">
				<div class="item-id">
					{{ i + 1 }}
				</div>
				<div class="item-name">
					{{ props.options[option] }}
				</div>
				<div class="item-buttons">
					<button @click="removeValue(option)">
						<font-awesome-icon :icon="faClose" />
					</button>
				</div>
			</div>
		</div>
		<div class="not-selected">
			<h4>Bewerber*innen auswählen</h4>
			<!-- not chosen options -->
			<button v-for="(opt) in notSelected" @click="addValue(opt)">
				{{ props.options[opt] }}
			</button>
		</div>
	</div>
</template>

<style scoped lang="scss">

$borderRadius: 0.25em;
$tagColor: #fbb;
$tagColorDark: #faa;
$nameWeight: 500;

.order-select {
	border: 1px solid #abb1bf;
	border-radius: 3px;
	width: 25em;

	h4 {
		display: block;
		font-weight: $nameWeight;
		padding: 0.3em;
	}

	.not-selected {
		display: block;
		border-top: 1px solid #abb1bf;

		button {
			display: block;

			border-radius: $borderRadius;
			margin: 0.5em;
			padding: 0.3em 0.5em;
			font-weight: $nameWeight;
			background-color: $tagColor;
		}
	}

	.selected {
		display: block;

		div {
			margin: 0.5em;
			display: flex;

			div {
				padding: 0.5em;
				margin: 0;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 2em;
			}

			.item-id {
				border-radius: $borderRadius 0 0 $borderRadius;
				width: 2em;
				background-color: $tagColorDark;
			}

			.item-name {
				background-color: $tagColor;
				font-weight: 500;
			}

			.item-buttons {
				border-radius: 0 $borderRadius $borderRadius 0;
				width: 2em;
				background-color: $tagColorDark;
			}
		}
	}
}

</style>