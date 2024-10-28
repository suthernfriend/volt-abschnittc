import {
	type ElectionCandidate,
	type ElectionGender,
	type ElectionLotResult,
	type ElectionRunoffResults,
	invertGender,
	renderCandidateName,
	type Vote,
} from "@/lib/Types";
import type {
	EvaluationMessage,
	EvaluationMessageCombined,
	EvaluationMessageCombinedPosition,
	EvaluationMessagePreliminaryListMessage,
	EvaluationMessagePreliminaryListSpotDuoTieBreaker,
	EvaluationMessageRunoffCandidate,
	EvaluationMessageTroublemakersCandidate,
} from "@/lib/EvaluationMessage";
import { arraySameContents, equalsWithEpsilon, requireAll } from "@/lib/utility";

import type { EvaluationConfirmation, EvaluationResult, EvaluationResultEntry, EvaluationRunoffCandidates } from "@/lib/EvaluationResult";
import { attemptAndCatchLotException, EvaluationNeedLotException } from "@/lib/EvaluationNeedLotException";
import { attemptAndCatchNeedConfirmationException, EvaluationNeedConfirmationException } from "@/lib/EvaluationNeedConfirmationException";

export interface EvaluationOptions {
	candidates: ElectionCandidate[];
	votes: Vote[];
	lotResults: ElectionLotResult[];
	runoffs: ElectionRunoffResults[];
	confirmations: EvaluationConfirmation[];
}

export class Evaluation {
	constructor(private options: EvaluationOptions) {}

	nullCountForCandidate(candidate: string, votes: Vote[]): number {
		let i = 0;

		for (const vote of votes) {
			if (vote.rankings[candidate] === 0) {
				i++;
			}
		}

		return i;
	}

	voteCountForCandidate(candidate: string, votes: Vote[]): number {
		let i = 0;

		for (const vote of votes) {
			if (vote.rankings.hasOwnProperty(candidate)) i++;
		}

		return i;
	}

	nonNullCountForCandidate(candidate: string, votes: Vote[]): number {
		return this.voteCountForCandidate(candidate, votes) - this.nullCountForCandidate(candidate, votes);
	}

	averagesForCandidates(candidates: string[], votes: Vote[]): { [candidate: string]: number } {
		const out: { [candidate: string]: number } = {};

		for (const candidate of candidates) {
			out[candidate] = this.averageForCandidate(candidate, votes);
		}

		return out;
	}

	averageForCandidate(candidate: string, votes: Vote[]): number {
		let sum = 0;

		for (const vote of votes) {
			if (vote.rankings.hasOwnProperty(candidate)) sum += vote.rankings[candidate];
		}

		const voteCount = this.voteCountForCandidate(candidate, votes);

		if (voteCount === 0) throw new Error(`Vote count for candidate ${this.candidateNameById(candidate)} (${candidate}) is zero`);

		return sum / voteCount;
	}

	static filterCandidatesByList(candidates: ElectionCandidate[], list: "male" | "female") {
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

	public hasRunoffWinner(): boolean {
		if (this.options.runoffs.length > 0) {
			const last = this.options.runoffs[this.options.runoffs.length - 1];
			return last.male !== last.female;
		} else {
			return false;
		}
	}

	public runoffResult(): ElectionRunoffResults | undefined {
		if (this.options.runoffs.length == 0) return undefined;

		return this.options.runoffs[this.options.runoffs.length - 1];
	}

	public evaluate(): EvaluationResult {
		try {
			return this.evaluateUnsafe();
		} catch (e) {
			if (e instanceof EvaluationNeedLotException) {
				return requireAll(e.details);
			} else if (e instanceof EvaluationNeedConfirmationException) {
				return requireAll(e.details);
			} else {
				throw e;
			}
		}
	}

	public evaluateUnsafe(): EvaluationResult {
		const messages: EvaluationMessage[] = [];

		if (this.options.votes.length === 0) {
			throw new Error("No votes to evaluate");
		}

		if (this.options.candidates.length === 0) {
			throw new Error("No candidates to evaluate");
		}

		const failed241: ElectionCandidate[] = [];
		const passed241: ElectionCandidate[] = [];

		const votes = this.uniqueVotes();

		messages.push({
			type: "vote-count",
			count: votes.length,
			male: votes.filter((value) => value.list === "male").length,
			female: votes.filter((value) => value.list === "female").length,
		});

		// 1. filter candidate
		// § 24 Abs. 1

		const troublemakers: EvaluationMessageTroublemakersCandidate[] = [];

		for (const candidate of this.options.candidates) {
			const nullCount = this.nullCountForCandidate(candidate.id, votes);
			const voteCount = this.nonNullCountForCandidate(candidate.id, votes);

			if (nullCount >= voteCount) {
				failed241.push(candidate);
			} else {
				passed241.push(candidate);
			}

			troublemakers.push({
				candidateId: candidate.id,
				nullVotes: nullCount,
				nonNullVotes: voteCount,
				passed: nullCount < voteCount,
			});
		}

		messages.push({ type: "troublemakers", candidates: troublemakers });

		// split into lists
		const male = Evaluation.filterCandidatesByList(passed241, "male");
		const female = Evaluation.filterCandidatesByList(passed241, "female");

		const maleList: EvaluationResultEntry[] = [],
			femaleList: EvaluationResultEntry[] = [];

		const { result: mResult, messages: maleMessages } = attemptAndCatchLotException(
			() =>
				this.preliminaryList(
					male.map((value) => value.id),
					votes.filter((value) => value.list === "male"),
				),
			{
				list: "male",
			},
		);
		maleList.push(...mResult);

		messages.push({
			type: "preliminary-list",
			messages: maleMessages,
			list: "male",
		});

		const { result: fResult, messages: femaleMessages } = attemptAndCatchLotException(
			() =>
				this.preliminaryList(
					female.map((value) => value.id),
					votes.filter((value) => value.list === "female"),
				),
			{
				list: "female",
			},
		);
		femaleList.push(...fResult);

		messages.push({
			type: "preliminary-list",
			messages: femaleMessages,
			list: "female",
		});

		const { candidate: maleRunoffCandidate, message: maleRunoffMessage } = Evaluation.getRunoffCandidate(
			maleList,
			this.options.candidates,
		);

		const { candidate: femaleRunoffCandidate, message: femaleRunoffMessage } = Evaluation.getRunoffCandidate(
			femaleList,
			this.options.candidates,
		);

		const runoffCandidates: EvaluationRunoffCandidates = [
			{
				female: femaleRunoffCandidate,
				male: maleRunoffCandidate,
			},
		];

		messages.push({
			type: "runoff-candidates",
			maleCandidate: maleRunoffMessage,
			femaleCandidate: femaleRunoffMessage,
		});

		if (maleList.length > 0 && femaleList.length > 0 && !this.hasRunoffWinner()) {
			// runoff undecided and we have two lists
			return {
				type: "need-runoff",
				preliminaryLists: { male: maleList, female: femaleList },
				runoff: runoffCandidates,
			};
		} else if (maleList.length === 0) {
			// only female list
			throw new Error("Not implemented");
		} else if (femaleList.length === 0) {
			// only male list
			throw new Error("Not implemented");
		} else if (this.hasRunoffWinner()) {
			// runoff decided, now we need to evaluate the spots

			const votes = this.runoffResult()!;

			const maleWon = votes.male > votes.female;

			const winnerList = maleWon ? maleList : femaleList;
			const loserList = maleWon ? femaleList : maleList;
			const winnerListGender: ElectionGender = maleWon ? "male" : "female";

			messages.push({
				type: "runoff",
				maleCandidateId: maleRunoffCandidate,
				femaleCandidateId: femaleRunoffCandidate,
				runoffs: this.options.runoffs,
			});

			const { result: dl, message } = attemptAndCatchNeedConfirmationException(
				() => {
					return this.evaluateDoubleList(winnerListGender, winnerList, loserList, this.options.candidates);
				},
				{
					runoff: [
						{
							male: maleRunoffCandidate,
							female: femaleRunoffCandidate,
						},
					],
					preliminaryLists: { male: maleList, female: femaleList },
				},
			);

			messages.push(message);

			return {
				type: "list-complete",
				finalList: dl,
				preliminaryLists: { male: maleList, female: femaleList },
				runoff: runoffCandidates,
				messages,
			};
		} else {
			throw new Error("Not implemented");
		}
	}

	hasConfirmedSpot(candidateId: string): boolean {
		const confirmation = this.options.confirmations.find((value) => value.candidate === candidateId);

		if (confirmation === undefined) {
			return false;
		} else {
			return confirmation.accepted;
		}
	}

	hasNotRejected(candidateId: string): boolean {
		const confirmation = this.options.confirmations.find((value) => value.candidate === candidateId);

		if (confirmation === undefined || confirmation.accepted) {
			return true;
		} else {
			return false;
		}
	}

	evaluateDoubleList(
		runoffWinner: ElectionGender,
		runoffWinnerList: EvaluationResultEntry[],
		runoffLoserList: EvaluationResultEntry[],
		candidates: ElectionCandidate[],
	): {
		result: EvaluationResultEntry[];
		message: EvaluationMessageCombined;
	} {
		const messages: EvaluationMessageCombinedPosition[] = [];
		const result: EvaluationResultEntry[] = [];
		const haveSpot: string[] = [];

		let previous = "none";
		let current: ElectionGender = runoffWinner;

		while (haveSpot.length < candidates.length) {
			let nextList: EvaluationResultEntry[];

			if (previous === "winner") {
				nextList = runoffLoserList;
				previous = "loser";
				current = invertGender(runoffWinner);
			} else {
				nextList = runoffWinnerList;
				previous = "winner";
				current = runoffWinner;
			}

			let nextPossible = nextList
				.filter((value) => !haveSpot.includes(value.candidateId))
				.filter((value) => this.hasNotRejected(value.candidateId));

			if (nextPossible.length === 0) {
				if (previous === "winner") {
					nextList = runoffWinnerList;
					previous = "winner";
				} else {
					nextList = runoffLoserList;
					previous = "loser";
				}
			}

			const notConsidered: string[] = [];

			for (const entry of nextPossible) {
				const minSpot = candidates.find((value) => value.id === entry.candidateId)!.minSpot;

				let nextSpot = haveSpot.length + 1;
				if (minSpot <= nextSpot) {
					if (!this.hasConfirmedSpot(entry.candidateId)) {
						throw new EvaluationNeedConfirmationException({
							candidate: entry.candidateId,
							position: nextSpot,
							partialList: result,
						});
					}

					haveSpot.push(entry.candidateId);
					result.push({
						candidateId: entry.candidateId,
						score: entry.score,
						shift: entry.shift,
						position: nextSpot,
					});
					messages.push({
						position: nextSpot,
						candidateId: entry.candidateId,
						score: entry.score,
						shift: entry.shift,
						skippedCandidatesBecauseMinSpot: notConsidered,
						preliminaryList: current,
					});
					break;
				}

				notConsidered.push(entry.candidateId);
			}
		}

		return {
			result,
			message: {
				type: "combined",
				positions: messages,
			},
		};
	}

	static evaluateSingleList(list: EvaluationResultEntry[], candidates: ElectionCandidate[]): EvaluationResultEntry[] {
		throw new Error("Not implemented");
	}

	static getRunoffCandidate(
		list: EvaluationResultEntry[],
		candidates: ElectionCandidate[],
	): {
		candidate: string;
		message: EvaluationMessageRunoffCandidate;
	} {
		let minSpot = 1;
		const maxSpot = candidates.map((value) => value.minSpot).reduce((a, b) => Math.max(a, b));

		const considered: string[] = [];

		while (minSpot <= maxSpot) {
			for (const entry of list) {
				const id = entry.candidateId;
				const candidate = candidates.find((value) => value.id === id)!;
				if (candidate.minSpot <= minSpot)
					return {
						candidate: id,
						message: {
							candidateId: id,
							skippedCandidatesBecauseMinSpot: considered,
						},
					};
				else considered.push(id);
			}

			minSpot++;
		}

		throw new Error("No candidate found for runoff");
	}

	preliminaryList(
		candidates: string[],
		votes: Vote[],
	): {
		result: EvaluationResultEntry[];
		messages: EvaluationMessagePreliminaryListMessage[];
	} {
		const messages: EvaluationMessagePreliminaryListMessage[] = [];

		const result: EvaluationResultEntry[] = [];
		let next = 1;
		const shift: { [candidateId: string]: number } = {};

		for (const candidateId of candidates) shift[candidateId] = 0;

		while (result.length < candidates.length) {
			console.log(`Now determining position ${next} of ${candidates.length}`);

			const toConsiderForNext = candidates
				.filter((value) => result.find((value1) => value1.candidateId === value) === undefined)
				.map((value) => value);

			console.log(`${toConsiderForNext.length} candidates left for position ${next}`);

			// find out how many candidates have the highest average
			let twoHighest: string | [string, string] | undefined = undefined;

			twoHighest = attemptAndCatchLotException(() => this.getTwoHighest(toConsiderForNext, votes), {
				position: next,
			});

			if (twoHighest === undefined) {
				throw new Error("This is not possible");
			} else if (typeof twoHighest === "string") {
				console.log(`There is only one candidate with the highest average: ${this.candidateNameById(twoHighest)}`);

				const score = this.averageForCandidate(twoHighest, votes);
				const theShift = -shift[twoHighest];
				result.push({
					candidateId: twoHighest,
					score: score,
					shift: theShift,
					position: next,
				});
				messages.push({
					type: "preliminary-list-spot-single",
					position: next,
					score: score,
					candidateId: twoHighest,
					shift: theShift,
				});
			} else {
				console.log(`Two highest: ${twoHighest.length}`);
				console.log(
					`Need direct comparison between: ${this.candidateNameById(twoHighest[0])} and ${this.candidateNameById(twoHighest[1])}.`,
				);

				const dcr = this.directComparison(twoHighest[0], twoHighest[1], votes);

				const { a, b, equal, excluded } = dcr;

				const theHigher = a > b ? twoHighest[0] : twoHighest[1];
				const theLower = a > b ? twoHighest[1] : twoHighest[0];
				const winnerBallots = Math.max(a, b);
				const loserBallots = Math.min(a, b);

				const winnerScore = this.averageForCandidate(theHigher, votes);
				const loserScore = this.averageForCandidate(theLower, votes);

				console.log(
					`Direct comparison won by ${this.candidateNameById(theHigher)} (${winnerBallots} vs ${this.candidateNameById(theLower)}: ${loserBallots})`,
				);

				const winnerShift = -shift[theHigher];
				result.push({
					candidateId: theHigher,
					score: winnerScore,
					shift: winnerShift,
					position: next,
				});

				// only increase shift if the lower one is the one that has the higher rating
				if (theLower === twoHighest[0]) shift[theLower]++;

				const loserShiftNow = -shift[theLower];
				messages.push({
					type: "preliminary-list-spot-duo",
					position: next,
					directComparisonExcludedBallots: excluded,
					directComparisonWinner: dcr.winner,
					directComparisonTieBreaker: dcr.messages,
					equalBallots: equal,
					winner: {
						score: winnerScore,
						candidateId: theHigher,
						shift: winnerShift,
						directComparisonBallots: winnerBallots,
					},
					loser: {
						score: loserScore,
						candidateId: theLower,
						shift: loserShiftNow,
						directComparisonBallots: loserBallots,
					},
				});
			}

			next++;
		}

		return {
			result,
			messages,
		};
	}

	candidateNameById(id: string): string {
		const candidate = this.options.candidates.find((value) => value.id === id);
		if (candidate === undefined) {
			throw new Error(`Candidate with id ${id} not found`);
		}
		return renderCandidateName(candidate);
	}

	directComparison(
		candidateA: string,
		candidateB: string,
		votes: Vote[],
	): {
		a: number;
		b: number;
		equal: number;
		excluded: number;
		messages: EvaluationMessagePreliminaryListSpotDuoTieBreaker[];
		winner: string;
	} {
		const nameA = this.candidateNameById(candidateA);
		const nameB = this.candidateNameById(candidateB);

		console.log(`Performing direct comparison for candidates ${nameA} and ${nameB} with ${votes.length} votes`);

		let a = 0;
		let b = 0;
		let equal = 0;
		let excluded = 0;

		for (const vote of votes) {
			if (vote.rankings[candidateA] === undefined || vote.rankings[candidateB] === undefined) {
				excluded++;
			} else if (vote.rankings[candidateA] === vote.rankings[candidateB]) {
				equal++;
			} else if (vote.rankings[candidateA] < vote.rankings[candidateB]) {
				b++;
			} else if (vote.rankings[candidateA] > vote.rankings[candidateB]) {
				a++;
			}
		}

		if (a == b) {
			// runoff with higher points more often

			const obj = this.highestRankedCandidateByPointCounts([candidateA, candidateB], votes);

			let winner = obj.candidates[0];

			if (obj.candidates.length > 1) {
				winner = this.getLotWinnerOrThrow(obj.candidates);
			}

			return {
				winner,
				equal,
				messages: obj.messages,
				b,
				excluded,
				a,
			};
		} else if (a > b) {
			return { a, b, equal, messages: [], excluded, winner: candidateA };
		} else {
			return { a, b, equal, messages: [], excluded, winner: candidateB };
		}
	}

	candidateNamesByIds(ids: string[]): string[] {
		return ids.map((value) => this.candidateNameById(value));
	}

	highestRankedCandidateByPointCounts(
		candidates: string[],
		votes: Vote[],
	): {
		candidates: string[];
		messages: EvaluationMessagePreliminaryListSpotDuoTieBreaker[];
	} {
		const messages: EvaluationMessagePreliminaryListSpotDuoTieBreaker[] = [];

		console.log(`Trying to determine highest point count for candidates: ${this.candidateNamesByIds(candidates).join(", ")}`);

		let leftInComparison = [...candidates];
		let i = 10;
		while (leftInComparison.length > 1 && i > 0) {
			const rr = this.highestRankedCandidatesByPointCount(i, leftInComparison, votes);
			leftInComparison = rr.candidates;
			messages.push(rr.message);
			i--;
		}

		console.log(`Highest point count: ${this.candidateNamesByIds(leftInComparison).join(", ")}`);

		return {
			candidates: leftInComparison,
			messages,
		};
	}

	highestRankedCandidatesByPointCount(
		count: number,
		candidates: string[],
		votes: Vote[],
	): { candidates: string[]; message: EvaluationMessagePreliminaryListSpotDuoTieBreaker } {
		const nCount: { [candidateId: string]: number } = {};

		console.log(`Comparing ${this.candidateNamesByIds(candidates).join(", ")} candidates by point count of ${count}`);

		for (const candidate of candidates) {
			nCount[candidate] = 0;
		}

		// IMPORTANT: Ballots are not excluded here in case one has an abstention
		for (const vote of votes) {
			for (const candidate of candidates) {
				if (vote.rankings[candidate] === count) {
					nCount[candidate]++;
				}
			}
		}

		console.log(`Point count for ${count}: ${JSON.stringify(nCount)}`);

		// return the highest
		const highest = Math.max(...Object.values(nCount));

		const out: string[] = [];
		for (const k in nCount) if (nCount[k] === highest) out.push(k);

		return {
			candidates: out,
			message: {
				points: count,
				counts: nCount,
			},
		};
	}

	getLotWinnerOrThrow(candidates: string[]): string {
		for (const lr of this.options.lotResults) {
			if (lr.winner && arraySameContents(lr.candidates, candidates)) return lr.winner;
		}

		throw new EvaluationNeedLotException({
			candidates: candidates,
		});
	}

	getTwoHighest(candidates: string[], votes: Vote[]): [string, string] | string {
		if (candidates.length === 0) throw new Error("No candidates to compare");

		// first
		const first = this.getHighestAverage(candidates, votes);

		if (candidates.length === 1) return candidates[0];
		else if (first.length === 2) {
			console.log("Two candidates have the highest average");
			return [first[0], first[1]];
		} else if (first.length > 2) {
			// the two candidates which have a higher score more often
			const obj = this.highestRankedCandidateByPointCounts(first, votes);

			const highest = obj.candidates;

			// TODO: do not ignore messages
			if (highest.length === 2) {
				console.log("Two candidates have been selected by point counts.");
				return [highest[0], highest[1]];
			}

			if (highest.length === 1) {
				const withoutHeighest = first.filter((value) => value !== highest[0]);
				const nextHighest = this.getHighestAverage(withoutHeighest, votes);

				if (nextHighest.length === 1) return [highest[0], nextHighest[0]];
			}

			console.log(`${highest.length} candidates have the same points. Need lot`);
			const lotFirst = this.getLotWinnerOrThrow(highest);
			const lotSecond = this.getLotWinnerOrThrow(highest.filter((v) => v !== lotFirst));

			return [lotFirst, lotSecond];
		} else if (first.length === 1) {
			// we have 1 guy with the highest average
			const withoutHighest = candidates.filter((value) => value !== first[0]);

			// by average
			const secondHighestByAverage = this.getHighestAverage(withoutHighest, votes);

			if (secondHighestByAverage.length === 1) return [first[0], secondHighestByAverage[0]];

			console.log(
				`For the second spot ${secondHighestByAverage.length} candidates have the same average. ` +
					`Determining second spot by point counts. (${this.candidateNamesByIds(secondHighestByAverage).join(", ")})`,
			);

			const obj2 = this.highestRankedCandidateByPointCounts(secondHighestByAverage, votes);

			const secondHighest = obj2.candidates;
			// TODO: do not ignore messages

			if (secondHighest.length === 1) return [first[0], secondHighest[0]];

			// need lot
			const winner = this.getLotWinnerOrThrow(secondHighest);
			return [first[0], winner];
		} else {
			console.log(`Two highest count is empty? ${candidates.length} candidates given`);
			throw new Error("This is not possible");
		}
	}

	/**
	 * If the first N candidates with the same average
	 */
	getHighestAverage(candidates: string[], votes: Vote[]): string[] {
		if (candidates.length === 0) {
			return [];
		}

		if (candidates.length === 1) {
			return [candidates[0]];
		}

		const averages = this.averagesForCandidates(candidates, votes);
		const highest = Math.max(...Object.values(averages));

		console.log(averages);

		const out: string[] = [];
		for (const k in averages) if (equalsWithEpsilon(averages[k], highest, 1e-7)) out.push(k);
		return out;
	}
}
