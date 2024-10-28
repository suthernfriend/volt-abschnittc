import { type Election, renderCandidateName } from "@/lib/Types";
import { Evaluation } from "@/lib/Evaluation";
import { BallotValidatorImpl } from "@/lib/BallotValidator";

import { type EvaluationResult, hasRunoffCandidates } from "@/lib/EvaluationResult";
import { ref, type Ref, watch } from "vue";
import Container from "@/lib/Container";

export interface VoteEvaluator {
	evaluate(election: Election): EvaluationResult;
}

export class VoteEvaluatorImpl implements VoteEvaluator {
	evaluate(election: Election): EvaluationResult {
		const ballotValidator = new BallotValidatorImpl({
			votes: election.votes,
		});

		const evaluation = new Evaluation({
			votes: ballotValidator.merged(),
			candidates: election.candidates,
			runoffs: election.runoffs,
			lotResults: election.lots,
			confirmations: election.confirmations,
		});

		return evaluation.evaluate();
	}
}

export function runoffCandidateNames(election?: Election, result?: EvaluationResult): string[] {
	if (!election || !result) return [];

	if (!hasRunoffCandidates(result)) return [];

	// TODO: Multiple runoffs
	if (result.runoff.length !== 1) return [];

	const theRunoff = result.runoff[0];

	return [theRunoff.male, theRunoff.female]
		.map((candidate) => election.candidates.find((c) => c.id === candidate)!)
		.map((value) => renderCandidateName(value));
}

export function candidateNames(election: Election, candidateIds: string[]): string[] {
	const candidates = election.candidates.filter((c) => candidateIds.includes(c.id));
	return candidates.map((c) => renderCandidateName(c));
}

export function voteEvaluator(election: Election | Ref<Election>): Ref<EvaluationResult | undefined> {
	const result = ref<EvaluationResult>();

	if ("value" in election) {
		watch(election.value, () => {
			doEvaluate();
		});
	}

	async function evaluate() {
		const evaluator = await Container.voteEvaluator();

		if ("value" in election) {
			return evaluator.evaluate(election.value);
		} else {
			return evaluator.evaluate(election);
		}
	}

	function doEvaluate() {
		evaluate()
			.then((r) => (result.value = r))
			.catch((e) => console.error(e));
	}

	doEvaluate();

	return result;
}
