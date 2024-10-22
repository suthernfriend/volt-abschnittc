<script setup lang="ts">

import {
	type ElectionCandidate,
	ElectionGenders,
	electionGenderString,
	renderCandidateName,
	sortCandidates
} from "@/lib/Types";
import type { AssistantProviderStep } from "@/lib/AssistantProvider";

const props = defineProps<{
	step: AssistantProviderStep;
	candidates: ElectionCandidate[];
}>();

</script>

<template>
	<p class="content">
		{{ props.step.explanation() }}
	</p>
	<div class="columns">
		<div class="column" v-for="gender in ElectionGenders">
			<div class="block">
				<h2 class="title is-4">{{ electionGenderString(gender) }}</h2>
				<table class="table is-striped is-fullwidth">
					<thead>
					<tr>
						<th>Name</th>
						<th>Ab Listenplatz</th>
					</tr>
					</thead>
					<tbody>
					<tr v-for="candidate in sortCandidates(props.candidates.filter(cd => cd.list === gender))">
						<td>{{ renderCandidateName(candidate) }}</td>
						<td>{{ candidate.minSpot }}</td>
					</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>

<style scoped>

</style>