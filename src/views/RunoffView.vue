<script setup lang="ts">

import type { Election } from "@/lib/Types";
import PdfPreview from "@/components/PdfPreview.vue";

const model = defineModel<Election>({
	required: true
});
</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">2. Wahlgang & ggf. Stichwahlen</h2>
		</div>
		<div class="block">
			<h3 class="title is-3">2. Wahlgang</h3>
			<div class="columns">
				<div class="column">
					<div class="buttons">
						<button class="button is-primary">Stimmzettel herunterladen</button>
					</div>
				</div>
				<div class="column is-one-third">
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>