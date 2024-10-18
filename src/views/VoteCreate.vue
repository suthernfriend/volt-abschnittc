<script setup lang="ts">
import { type Candidate, type ElectionGender, renderCandidateName, sortCandidates, type Vote } from "@/lib/Types";
import { computed, ref } from "vue";

const props = defineProps<{
	candidates: Candidate[];
	gender: ElectionGender;
}>();

const emits = defineEmits<{
	(e: "created", vote: Vote): void;
}>();

function candidates(gender: "male" | "female") {
	return sortCandidates(props.candidates.filter((candidate) => candidate.list === gender));
}

const votes = ref<{ [candidateId: string]: string }>({});
const ballotId = ref<string>("");

for (const candidate of props.candidates) {
	if (votes.value[candidate.id] === undefined) {
		votes.value[candidate.id] = "";
	}
}

function inputClasses(id: string): string[] {
	const vote = votes.value[id];

	const greenValues = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
	const yellowValues = [""];

	if (greenValues.includes(vote)) {
		return ["is-success"];
	} else if (yellowValues.includes(vote)) {
		return ["is-warning"];
	} else {
		return ["is-danger"];
	}
}

const ballotValid = computed(() => {
	if (ballotId.value === "")
		return false;

	for (const key in votes.value) {
		if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", ""].includes(votes.value[key]))
			return false;
	}

	return true;
})

function complete() {
	const vote: Vote = {
		ballotId: ballotId.value,
		list: props.gender,
		created: `${new Date().getTime()}`,
		rankings: Object.fromEntries(Object.entries(votes.value)
			.filter(value => value[1] !== "")
			.map(value => [value[0], parseInt(value[1])])
		)
	};

	emits("created", vote);
}
</script>
<template>
	<div class="box">
		<h3 class="title is-4">Neue Eingabe</h3>
		<div class="field px-3">
			<label class="label">Stimmzettel Nr.</label>
			<div class="control">
				<input type="text" v-model="ballotId" class="input" placeholder="31" />
			</div>
		</div>
		<table class="table is-fullwidth is-striped">
			<thead>
				<tr>
					<th>Name</th>
					<th>Punktzahl</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(candidate, k) in candidates(gender)">
					<td>
						{{ renderCandidateName(candidate) }}
						<em>(ab Listenplatz {{ candidate.minSpot }})</em>
					</td>
					<td><input :class="inputClasses(candidate.id)" v-model="votes[candidate.id]" type="text" class="input" /></td>
				</tr>
			</tbody>
		</table>
		<div class="block">
			<button :disabled="!ballotValid" @click="complete" class="button is-primary">Hinzufügen</button>
		</div>
	</div>
</template>
