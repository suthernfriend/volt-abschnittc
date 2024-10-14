import type { Candidate, Vote } from "@/lib/Types";

export interface ResultEntry {
	candidateId: string;
	score: number;
	shift: number;
	position: number;
}

export interface NeedRunoffResult {
	type: "need-runoff";
	preliminaryLists: {
		male: ResultEntry[];
		female: ResultEntry[];
	};
	runoffCandidates: {
		maleCandidate: string;
		femaleCandidate: string;
	};
}

export interface NeedLotResult {
	type: "need-lot";
	toLot: {
		candidates: string[];
		position: number;
		list: "male" | "female";
	};
	preliminaryLists: NeedRunoffResult["preliminaryLists"];
	runoffCandidates: NeedRunoffResult["runoffCandidates"];
}

export interface NeedConfirmationResult {
	type: "need-confirmation";
	confirmationRequiredFor: {
		candidate: string;
		position: number;
	};
	list: ResultEntry[];
	preliminaryLists: NeedRunoffResult["preliminaryLists"];
	runoffCandidates: NeedRunoffResult["runoffCandidates"];
}

export interface ListCompleteResult {
	type: "list-complete";
	list: ResultEntry[];
	preliminaryLists: NeedRunoffResult["preliminaryLists"];
	runoffCandidates: NeedRunoffResult["runoffCandidates"];
}

export type Result = ListCompleteResult | NeedConfirmationResult | NeedLotResult | NeedRunoffResult;

export interface EvaluationOptions {
	candidates: Candidate[];
	votes: Vote[];
	runoffWinner?: string;
}

export class Evaluation {
	constructor(private options: EvaluationOptions) {}

	static nullCountForCandidate(candidate: string, votes: Vote[]): number {
		let i = 0;

		for (const vote of votes) {
			if (vote.rankings[candidate] === 0) {
				i++;
			}
		}

		return i;
	}

	static voteCountForCandidate(candidate: string, votes: Vote[]): number {
		let i = 0;

		for (const vote of votes) {
			if (vote.rankings.hasOwnProperty(candidate)) i++;
		}

		return i;
	}

	static nonNullCountForCandidate(candidate: string, votes: Vote[]): number {
		return this.voteCountForCandidate(candidate, votes) - this.nullCountForCandidate(candidate, votes);
	}

	static averagesForCandidates(candidates: string[], votes: Vote[]): { [candidate: string]: number } {
		const out: { [candidate: string]: number } = {};

		for (const candidate of candidates) {
			out[candidate] = this.averageForCandidate(candidate, votes);
		}

		return out;
	}

	static averageForCandidate(candidate: string, votes: Vote[]): number {
		let sum = 0;

		for (const vote of votes) {
			if (vote.rankings.hasOwnProperty(candidate)) sum += vote.rankings[candidate];
		}

		return sum / this.voteCountForCandidate(candidate, votes);
	}

	static filterCandidatesByList(candidates: Candidate[], list: "male" | "female") {
		return candidates.filter((candidate) => candidate.list === list);
	}

	uniqueVotes(): Vote[] {
		const uniqueVotes: Vote[] = [];
		const seenBallotIds: string[] = [];
		for (const vote of this.options.votes) {
			if (seenBallotIds.includes(vote.ballotId)) {
				continue;
			}
			seenBallotIds.push(vote.ballotId);
			uniqueVotes.push(vote);
		}
		return uniqueVotes;
	}

	public evaluate(): Result {
		if (this.options.votes.length === 0) {
			throw new Error("No votes to evaluate");
		}

		if (this.options.candidates.length === 0) {
			throw new Error("No candidates to evaluate");
		}

		const failed241: Candidate[] = [];
		const passed241: Candidate[] = [];

		const votes = this.uniqueVotes();

		// 1. filter candidate
		// § 24 Abs. 1
		for (const candidate of this.options.candidates) {
			const nullCount = Evaluation.nullCountForCandidate(candidate.id, votes);
			const voteCount = Evaluation.nonNullCountForCandidate(candidate.id, votes);

			if (nullCount >= voteCount) {
				failed241.push(candidate);
			} else {
				passed241.push(candidate);
			}
		}

		// split into lists
		const male = Evaluation.filterCandidatesByList(passed241, "male");
		const female = Evaluation.filterCandidatesByList(passed241, "female");

		const maleList = Evaluation.preliminaryList(
			male.map((value) => value.id),
			votes,
		);
		const femaleList = Evaluation.preliminaryList(
			female.map((value) => value.id),
			votes,
		);

		const maleRunoffCandidate = Evaluation.getRunoffCandidate(maleList, this.options.candidates);
		const femaleRunoffCandidate = Evaluation.getRunoffCandidate(femaleList, this.options.candidates);

		if (maleList.length > 0 && femaleList.length > 0 && this.options.runoffWinner === undefined) {
			// runoff undecided and we have two lists
			return {
				type: "need-runoff",
				preliminaryLists: { male: maleList, female: femaleList },
				runoffCandidates: { maleCandidate: maleRunoffCandidate, femaleCandidate: femaleRunoffCandidate },
			};
		} else if (maleList.length === 0) {
			// only female list
			throw new Error("Not implemented");

		} else if (femaleList.length === 0) {
			// only male list
			throw new Error("Not implemented");

		} else if (this.options.runoffWinner !== undefined) {
			// runoff decided, now we need to evaluate the spots

			const winnerList = this.options.runoffWinner == maleRunoffCandidate ? maleList : femaleList;
			const loserList = this.options.runoffWinner == femaleRunoffCandidate ? maleList : femaleList;

			const dl = Evaluation.evaluateDoubleList(winnerList, loserList, this.options.candidates);

			return {
				type: "list-complete",
				list: dl,
				preliminaryLists: { male: maleList, female: femaleList },
				runoffCandidates: { maleCandidate: maleRunoffCandidate, femaleCandidate: femaleRunoffCandidate },
			};
		} else {
			throw new Error("Not implemented");
		}
	}

	static evaluateDoubleList(runoffWinnerList: ResultEntry[], runoffLoserList: ResultEntry[], candidates: Candidate[]): ResultEntry[] {
		const result: ResultEntry[] = [];
		const haveSpot: string[] = [];
		let previous = "none";

		while (haveSpot.length < result.length) {
			let nextList: ResultEntry[];

			if (previous === "winner") {
				nextList = runoffLoserList;
				previous = "loser";
			} else {
				nextList = runoffWinnerList;
				previous = "winner";
			}

			let nextPossible = nextList.filter((value) => !haveSpot.includes(value.candidateId));

			if (nextPossible.length === 0) {
				if (previous === "winner") {
					nextList = runoffWinnerList;
					previous = "winner";
				} else {
					nextList = runoffLoserList;
					previous = "loser";
				}
			}

			for (const entry of nextPossible) {
				const minSpot = candidates.find((value) => value.id === entry.candidateId)!.minSpot;

				if (minSpot <= haveSpot.length + 1) {
					result.push({
						candidateId: entry.candidateId,
						score: entry.score,
						shift: entry.shift,
						position: haveSpot.length + 1,
					});
					haveSpot.push(entry.candidateId);
					break;
				}
			}
		}

		return result;
	}

	static evaluateSingleList(list: ResultEntry[], candidates: Candidate[]): ResultEntry[] {
		throw new Error("Not implemented");
	}

	static getRunoffCandidate(list: ResultEntry[], candidates: Candidate[]) {
		let minSpot = 1;
		const maxSpot = candidates.map((value) => value.minSpot).reduce((a, b) => Math.max(a, b));
		while (minSpot <= maxSpot) {
			for (const entry of list) {
				const id = entry.candidateId;
				const candidate = candidates.find((value) => value.id === id)!;
				if (candidate.minSpot <= minSpot) return id;
			}

			minSpot++;
		}

		throw new Error("No candidate found for runoff");
	}

	static preliminaryList(candidates: string[], votes: Vote[]): ResultEntry[] {
		const result: ResultEntry[] = [];
		let next = 1;
		const shift: { [candidateId: string]: number } = {};

		for (const candidateId of candidates) shift[candidateId] = 0;

		while (result.length < candidates.length) {
			const toConsiderForNext = candidates
				.filter((value) => result.find((value1) => value1.candidateId === value) === undefined)
				.map((value) => value);

			// find out how many candidates have the heighest average
			const twoHighest = Evaluation.getTwoHighest(toConsiderForNext, votes);

			if (typeof twoHighest === "string") {
				result.push({
					candidateId: twoHighest,
					score: Evaluation.averageForCandidate(twoHighest, votes),
					shift: -shift[twoHighest],
					position: next,
				});
			} else {
				const higher = Evaluation.directComparison(twoHighest[0], twoHighest[1], votes);

				const theHigher = higher > 0 ? twoHighest[0] : twoHighest[1];
				const theLower = higher > 0 ? twoHighest[1] : twoHighest[0];

				result.push({
					candidateId: theHigher,
					score: Evaluation.averageForCandidate(theHigher, votes),
					shift: -shift[theHigher],
					position: next,
				});

				// only increase shift if the lower one is the one that has the higher rating
				if (theLower === twoHighest[0]) shift[theLower]++;
			}

			next++;
		}

		return result;
	}

	static directComparison(candidateA: string, candidateB: string, votes: Vote[]): number {
		let a = 0;
		let b = 0;

		for (const vote of votes) {
			if (vote.rankings[candidateA] === undefined || vote.rankings[candidateB] === undefined) continue;

			if (vote.rankings[candidateA] < vote.rankings[candidateB]) {
				a++;
			} else if (vote.rankings[candidateA] > vote.rankings[candidateB]) {
				b++;
			}
		}

		return b - a;
	}

	static highestRankedCandidateByPointCounts(candidates: string[], votes: Vote[]): string[] {
		let leftInComparison = [...candidates];
		let i = 1;
		while (leftInComparison.length > 1 && i > 0) {
			leftInComparison = this.highestRankedCandidatesByPointCount(i, leftInComparison, votes);
			i--;
		}

		return leftInComparison;
	}

	static highestRankedCandidatesByPointCount(count: number, candidates: string[], votes: Vote[]): string[] {
		const nCount: { [candidateId: string]: number } = {};

		for (const candidate of candidates) {
			nCount[candidate] = 0;
		}

		for (const vote of votes) {
			for (const candidate of candidates) {
				if (vote.rankings[candidate] === count) {
					nCount[candidate]++;
				}
			}
		}

		// return the highest
		const highest = Math.max(...Object.values(nCount));

		const out: string[] = [];
		for (const k in nCount) if (nCount[k] === highest) out.push(k);

		return out;
	}

	static getTwoHighest(candidates: string[], votes: Vote[]): [string, string] | string {
		// first
		const first = this.getHighestAverage(candidates, votes);

		if (candidates.length === 1) return candidates[0];
		else if (first.length === 2) return [first[0], first[1]];
		else if (first.length > 2) {
			// the two candidates which have a higher score more often
			const highest = this.highestRankedCandidateByPointCounts(first, votes);

			if (highest.length === 2) return [highest[0], highest[1]];

			if (highest.length === 1) {
				const withoutHeighest = first.filter((value) => value !== highest[0]);
				const nextHighest = this.getHighestAverage(withoutHeighest, votes);

				if (nextHighest.length === 1) return [highest[0], nextHighest[0]];
			}

			throw new Error("This is not possible without all votes being equal");
		} else if (first.length === 1) {
			// we have 1 guy with the highest average
			const withoutHighest = candidates.filter((value) => value !== first[0]);

			// by average
			const secondHighestByAverage = this.getHighestAverage(withoutHighest, votes);

			if (secondHighestByAverage.length === 1) return [first[0], secondHighestByAverage[0]];

			const secondHighest = this.highestRankedCandidateByPointCounts(withoutHighest, votes);

			if (secondHighest.length === 1) return [first[0], secondHighest[0]];

			throw new Error("Cannot determine second highest: All votes identical");
		} else {
			throw new Error(`Huh ? ${first}`);
		}
	}

	/**
	 * If the first N candidates with the same average
	 */
	static getHighestAverage(candidates: string[], votes: Vote[]): string[] {
		if (candidates.length === 0) {
			return [];
		}

		if (candidates.length === 1) {
			return [candidates[0]];
		}

		const averages = this.averagesForCandidates(candidates, votes);
		const highest = Math.max(...Object.values(averages));

		const out: string[] = [];
		for (const k in averages) if (this.equalsWithEpsilon(averages[k], highest, 1e-7)) out.push(k);
		return out;
	}

	static equalsWithEpsilon(a: number, b: number, epsilon: number): boolean {
		return Math.abs(a - b) < epsilon;
	}
}
