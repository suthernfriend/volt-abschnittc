<script setup lang="ts">

import type { Candidate, Election } from "@/lib/Types";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { faPlusSquare, faTrashCan } from "@fortawesome/free-regular-svg-icons";
import { ref } from "vue";
import { v4 } from "uuid";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

const election = defineModel<Election>({ required: true });

function emptyCandidate(): Candidate {
	return {
		firstName: "",
		lastName: "",
		id: v4(),
		title: "",
		extra: ""
	};
}

const newCandidate = ref<Candidate>(emptyCandidate());

function addCandidate() {
	election.value.candidates.push(newCandidate.value);
	newCandidate.value = emptyCandidate();
}

function removeCandidate(index: number) {
	election.value.candidates.splice(index, 1);
}

</script>

<template>
	<div class="container">
		<div class="block mt-5">
			<h2 class="title is-2">Kandidierende</h2>
		</div>
		<div class="box">
			<table class="table">
				<thead>
				<tr>
					<th></th>
					<th>Vorname</th>
					<th>Nachname</th>
					<th>Titel</th>
					<th>Extra</th>
					<th></th>
				</tr>
				</thead>
				<tbody>
				<tr v-for="(candidate, i) in election.candidates">
					<td><span class="tag">{{ candidate.id }}</span></td>
					<td><input type="text" class="input" v-model="election.candidates[i].firstName"></td>
					<td><input type="text" class="input" v-model="election.candidates[i].lastName"></td>
					<td><input type="text" class="input" v-model="election.candidates[i].title"></td>
					<td><input type="text" class="input" v-model="election.candidates[i].extra"></td>
					<td>
						<button @click="removeCandidate(i)" class="button is-danger">
							<font-awesome-icon :icon="faTrashCan" />
						</button>
					</td>
				</tr>
				<tr>
					<td><span class="tag">{{ newCandidate.id }}</span></td>
					<td><input type="text" class="input" v-model="newCandidate.firstName"></td>
					<td><input type="text" class="input" v-model="newCandidate.lastName"></td>
					<td><input type="text" class="input" v-model="newCandidate.title"></td>
					<td><input type="text" class="input" v-model="newCandidate.extra"></td>
					<td>
						<button @click="addCandidate" class="button is-success">
							<font-awesome-icon :icon="faPlus" />
						</button>
					</td>
				</tr>
				</tbody>
			</table>
		</div>
	</div>
</template>

<style scoped>

</style>