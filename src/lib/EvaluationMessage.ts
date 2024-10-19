import type { ElectionGender } from "@/lib/Types";

export interface EvaluationMessageVoteCount {
	type: "vote-count";
	count: number;
	male: number;
	female: number;
}

export interface EvaluationMessageTroublemakersCandidate {
	candidateId: string;
	nullVotes: number;
	nonNullVotes: number;
	passed: boolean;
}

export interface EvaluationMessageTroublemakers {
	type: "troublemakers";
	candidates: EvaluationMessageTroublemakersCandidate[];
}

export interface EvaluationMessagePreliminaryListSpotCandidate {
	score: number;
	candidateId: string;
	shift: number;
}

export interface EvaluationMessagePreliminaryListSpotDuoCandidate extends EvaluationMessagePreliminaryListSpotCandidate {
	directComparisonBallots: number;
}

export interface EvaluationMessagePreliminaryListSpotDuoTieBreaker {
	points: number;
	counts: { [candidateId: string]: number };
}

export interface EvaluationMessagePreliminaryListSpotDuo {
	type: "preliminary-list-spot-duo";
	position: number;
	directComparisonExcludedBallots: number;
	directComparisonWinner: string;
	directComparisonTieBreaker?: EvaluationMessagePreliminaryListSpotDuoTieBreaker[];
	equalBallots: number;
	winner: EvaluationMessagePreliminaryListSpotDuoCandidate;
	loser: EvaluationMessagePreliminaryListSpotDuoCandidate;
}

export interface EvaluationMessagePreliminaryListSpotSingle extends EvaluationMessagePreliminaryListSpotCandidate {
	type: "preliminary-list-spot-single";
	position: number;
}

export type EvaluationMessagePreliminaryListSpot = EvaluationMessagePreliminaryListSpotSingle | EvaluationMessagePreliminaryListSpotDuo;

export type EvaluationMessagePreliminaryListMessage = EvaluationMessagePreliminaryListSpot;

export interface EvaluationMessagePreliminaryList {
	type: "preliminary-list";
	list: ElectionGender;
	messages: EvaluationMessagePreliminaryListMessage[];
}

export interface EvaluationMessageRunoffCandidate {
	candidateId: string;
	skippedCandidatesBecauseMinSpot: string[];
}

export interface EvaluationMessageRunoffCandidates {
	type: "runoff-candidates";
	maleCandidate: EvaluationMessageRunoffCandidate;
	femaleCandidate: EvaluationMessageRunoffCandidate;
}

export interface EvaluationMessageRunoff {
	type: "runoff";
	maleCandidateId: string;
	femaleCandidateId: string;
	maleVotes: number;
	femaleVotes: number;
}

export interface EvaluationMessageCombined {
	type: "combined";
	positions: EvaluationMessageCombinedPosition[];
}

export interface EvaluationMessageCombinedPosition {
	position: number;
	candidateId: string;
	preliminaryList: ElectionGender;
	score: number;
	shift: number;
	skippedCandidatesBecauseMinSpot: string[];
}

export type EvaluationMessage =
	| EvaluationMessageVoteCount
	| EvaluationMessageTroublemakers
	| EvaluationMessagePreliminaryList
	| EvaluationMessageRunoffCandidates
	| EvaluationMessageRunoff
	| EvaluationMessageCombined;
