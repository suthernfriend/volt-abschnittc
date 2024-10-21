import type { Election } from "@/lib/Types";
import type { Result } from "@/lib/Evaluation";
import { Evaluation } from "@/lib/Evaluation";
import { BallotValidatorImpl } from "@/lib/BallotValidator";

export interface VoteEvaluator {
	evaluate(election: Election): Result;
}

export class VoteEvaluatorImpl implements VoteEvaluator {

	evaluate(election: Election): Result {

		console.log(election.votes);

		const ballotValidator = new BallotValidatorImpl({
			votes: election.votes
		});

		const evaluation = new Evaluation({
			votes: ballotValidator.merged(),
			candidates: election.candidates,
			runoffs: election.runoffs
		});

		return evaluation.evaluate();
	}
}