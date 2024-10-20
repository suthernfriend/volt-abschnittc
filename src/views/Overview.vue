<script setup lang="ts">
import type { Election } from "@/lib/Types";
import TagsInput from "@/components/TagsInput.vue";
import TitleBlock from "@/components/TitleBlock.vue";
import Assistant from "@/views/Assistant.vue";

const election = defineModel<Election>({ required: true });

const settings: { [k in keyof Election["general"]]: string } = {
	assemblyName: "Name der Veranstaltung",
	electionName: "Name der Wahl",
	ballotIds: "Stimmzettel-IDs",
	lead: "Leitung der Zählkommission",
	countingCommission: "Mitglieder der Zählkommission"
};
</script>

<template>
	<div class="container">
		<title-block :size="3">Überblick</title-block>
		<div class="box">
			<div class="field" v-for="(v, k) in settings">
				<label class="label">{{ v }}</label>
				<div class="control">
					<input v-if="typeof election.general[k] === 'string'" class="input" type="text"
						   v-model="election.general[k]" />
					<tags-input v-if="Array.isArray(election.general[k])" v-model="election.general[k]" />
				</div>
			</div>
		</div>
	</div>
	<assistant />
</template>

<style scoped></style>
