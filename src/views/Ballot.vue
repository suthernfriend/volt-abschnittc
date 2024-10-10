<script setup lang="ts">

import type { Election } from "@/lib/Types";
import { ref } from "vue";

const election = defineModel<Election>({ required: true });
const ballotUrl = ref<string>("https://www.google.com");

const paperOptions = {
	"A42": "1 Stimmzettel auf A4 in 2 Spalten",
	"A41": "1 Stimmzettel auf A4",
	"2A4": "2 Stimmzettel auf A4",
	"A32": "1 Stimmzettel auf A3 in 2 Spalten",
	"A31": "1 Stimmzettel auf A3"
};

const ballotPaperType = ref<keyof typeof paperOptions>("A42");

</script>

<template>
	<div class="container mt-5">
		<div class="block mt-5">
			<h2 class="title is-2">Stimmzettel</h2>
		</div>

		<div class="columns">
			<div class="column">
				<div class="box">
					<div class="block">
						<div class="select">
							<select v-model="ballotPaperType">
								<option v-for="(v, k) in paperOptions" :value="k">{{ v }}</option>
							</select>
						</div>
					</div>
					<div class="block">
						Anzahl Bewerber: {{ election.candidates.length }}
					</div>
					<div class="block">
						<h3 class="title is-4">Stimmzettel herunterladen</h3>
						<div class="buttons">
							<button class="button is-warning">Männlich / diverse Liste</button>
							<button class="button is-info">Weiblich / diverse Liste</button>
						</div>
					</div>
				</div>
			</div>
			<div class="column">
				<div class="box">
					<iframe class="preview-frame" :src="ballotUrl" width="100%" height="800px"></iframe>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

.preview-frame {
	border: 1px solid #ccc;
}

</style>