import type { ElectionGender, Vote } from "@/lib/Types";

export interface BallotValidator {

	validate(): boolean;

	mergedByGender(gender: ElectionGender): Vote[];

	merged(): Vote[];

	additionalCountNeeded(): string[];
}

export interface BallotValidatorImplOptions {
	votes: Vote[];
}

export class BallotValidatorImpl implements BallotValidator {

	constructor(private options: BallotValidatorImplOptions) {
	}

	voteIds(): string[] {
		const ids = new Set<string>();

		for (const vote of this.options.votes) {
			ids.add(vote.ballotId);
		}

		return Array.from(ids);
	}

	mergeOrThrow(ballotId: string): Vote {
		const ballots = this.options.votes
			.filter(v => v.ballotId === ballotId)
			.sort((a, b) => parseInt(b.created) - parseInt(a.created));

		if (ballots.length === 0) {
			throw new Error(`No votes found for ballot ${ballotId}`);
		}

		if (ballots.length === 1) {
			throw new Error("Second count needed for ballot");
		}

		if (ballots.length > 2) {
			return ballots[0];
		}

		if (BallotValidatorImpl.equals(ballots[0], ballots[1])) {
			return ballots[0];
		} else {
			throw new Error(`Third count needed for ballot ${ballotId} cause votes are different`);
		}
	}

	static equals(a: Vote, b: Vote): boolean {
		if (a.ballotId !== b.ballotId) {
			return false;
		}

		const aKeys = Object.keys(a.rankings);
		const bKeys = Object.keys(b.rankings);

		if (aKeys.length !== bKeys.length) {
			return false;
		}

		for (const key of aKeys) {
			if (a.rankings[key] !== b.rankings[key]) {
				return false;
			}
		}

		return true;
	}

	mergedByGender(gender: ElectionGender): Vote[] {
		return this.merged()
			.filter(v => v.list === gender);
	}

	merged(): Vote[] {
		const ids = this.voteIds();
		const out: Vote[] = [];

		for (const id of ids) {
			const vote = this.mergeOrThrow(id);
			out.push(vote);
		}

		return out;
	}

	additionalCountNeeded(): string[] {
		const ids = this.voteIds();
		const needThird: string[] = [];

		for (const id of ids) {
			try {
				this.mergeOrThrow(id);
			} catch (e) {
				needThird.push(id);
			}
		}

		return needThird;
	}

	validate(): boolean {
		return this.additionalCountNeeded().length === 0;
	}

}