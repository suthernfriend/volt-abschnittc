<script setup lang="ts">

import type { Election } from "@/lib/Types";

const model = defineModel<Election>({
	required: true
});

</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Losen von Plätzen</h2>
		</div>
		<article class="message">
			<div class="message-body">
				Ein Auslosen von Plätzen ist nicht erforderlich.
			</div>
		</article>
	</div>
</template>

<style scoped>

</style>