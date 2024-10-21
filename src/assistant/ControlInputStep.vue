<script setup lang="ts">

import { toParagraphs } from "@/lib/utility";
import type { AssistantProviderStep } from "@/lib/AssistantProvider";
import { type Election, electionGenderString, type Vote } from "@/lib/Types";
import { BallotValidatorImpl } from "@/lib/BallotValidator";

const props = defineProps<{
	n: number;
	step: AssistantProviderStep;
	votes: Vote[]
}>();

const ballotValidator = new BallotValidatorImpl({
	votes: props.votes
});

</script>

<template>
	<div class="box">
		<h2 class="title is-3">Schritt {{ props.n }} - {{ props.step.title() }}</h2>
		<div class="content" v-html="toParagraphs(props.step.explanation())" />
		<div v-if="ballotValidator.validate()" class="block">
			<article class="message is-success">
				<div class="message-body">
					Alle Stimmzettel wurden korrekt ausgezählt und sind gültig.
					<p>
						{{ ballotValidator.mergedByGender("male").length }} Stimmzettel für die
						{{ electionGenderString("male")
						}} Liste und
					</p>
					<p>
						{{ ballotValidator.mergedByGender("female").length }} Stimmzettel für die
						{{ electionGenderString("female") }} Liste.
					</p>
				</div>
			</article>
		</div>
		<div v-else class="block">
			<article class="message is-danger">
				<div class="message-body">
					Es wurden ungültige Stimmzettel gefunden.
					Die Stimmzettel: {{ ballotValidator.additionalCountNeeded().join(", ") }} müssen erneut erfasst
					werden.
				</div>
			</article>
		</div>
	</div>
</template>

<style scoped>

</style>