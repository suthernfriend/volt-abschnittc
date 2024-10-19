<script setup lang="ts">
import type { Election, ElectionBallotIdType, ElectionGender } from "@/lib/Types";
import { ref } from "vue";
import { BallotGeneratorImpl } from "@/lib/BallotGeneratorImpl";
import type { PageSizeNames } from "@/lib/BallotGenerator";
import Container from "@/lib/Container";

const election = defineModel<Election>({ required: true });
const ballotUrl = ref<string>("about:blank");

const paperOptions: { [k in PageSizeNames]: string } = {
	A4_2: "1 Stimmzettel auf A4 in 2 Spalten",
	A4: "1 Stimmzettel auf A4",
	"2_A4": "2 Stimmzettel auf A4",
	A3_2: "1 Stimmzettel auf A3 in 2 Spalten",
	A3_3: "1 Stimmzettel auf A3 in 3 Spalten",
};

const ballotPaperType = ref<keyof typeof paperOptions>("A4_2");

const genderTexts : {[k in "male" | "female"]: string} = {
	"male": "Männlich / diverse Liste",
	"female": "Weiblich / diverse Liste",
};

async function download242() {
}

async function download241(list: ElectionGender) {
	const candidates = election.value.candidates.filter((v) => v.list === list);

	const uniqueId = election.value.general.ballotIds[list];

	const ballotGenerator = await Container.ballotGenerator();
	const ballot = await ballotGenerator.ballot232({
		pageSize: ballotPaperType.value,
		assemblyName: election.value.general.assemblyName,
		electionName: election.value.general.electionName + ` (${genderTexts[list]})`,
		candidates,
		uniqueId,
		maxPoints: 10
	});

	const url = URL.createObjectURL(new Blob([ballot], { type: "application/pdf" }));
	ballotUrl.value = url;
}
</script>

<template>
	<div class="container mt-5">
		<div class="block mt-5">
			<h2 class="title is-2">Stimmzettel</h2>
		</div>
		<div class="columns">
			<div class="column is-one-third">
				<div class="box">
					<div class="block">
						<div class="select">
							<select v-model="ballotPaperType">
								<option v-for="(v, k) in paperOptions" :value="k">{{ v }}</option>
							</select>
						</div>
					</div>
					<div class="block">Anzahl Bewerber: {{ election.candidates.length }}</div>
					<div class="block">
						<h3 class="title is-4">Stimmzettel herunterladen</h3>
						<div class="buttons">
							<button @click="download241('male')" class="button is-warning">{{ genderTexts["male"] }}</button>
							<button @click="download241('female')" class="button is-info">{{ genderTexts["female"] }}</button>
							<button @click="download242()" class="button is-success">Stichwahl</button>
						</div>
					</div>
				</div>
			</div>
			<div class="column is-two-thirds">
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
