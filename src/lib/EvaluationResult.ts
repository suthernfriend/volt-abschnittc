import type { EvaluationMessage } from "@/lib/EvaluationMessage";
import type { ElectionGender } from "@/lib/Types";

export type EvaluationEachGender<T> = {
	[k in ElectionGender]: T;
};

export type EvaluationPreliminaryLists = EvaluationEachGender<EvaluationResultEntry[]>;

export type EvaluationRunoffCandidates = EvaluationEachGender<string>[];

export interface EvaluationResultEntry {
	candidateId: string;
	score: number;
	shift: number;
	position: number;
}

export interface EvaluationConfirmation {
	accepted: boolean;
	candidate: string;
}

export interface EvaluationResultCommon {
}

export interface EvaluationResultHasFinalList {
	finalList: EvaluationResultEntry[];
}

export interface EvaluationResultHasPreliminaryLists {
	preliminaryLists: EvaluationPreliminaryLists;
}

export interface EvaluationResultHasRunoffCandidates {
	runoff: EvaluationRunoffCandidates;
}

export interface EvaluationResultHasPartialList {
	partialList: EvaluationResultEntry[];
}

export interface EvaluationResultNeedLot extends EvaluationResultCommon {
	type: "need-lot";
	candidates: string[];
	list: ElectionGender;
	position: number;
	score: number;
}

export interface EvaluationResultNeedRunoff
	extends EvaluationResultCommon,
		EvaluationResultHasPreliminaryLists,
		EvaluationResultHasRunoffCandidates {
	type: "need-runoff";
}

export interface EvaluationResultNeedConfirmation
	extends EvaluationResultCommon,
		EvaluationResultHasPreliminaryLists,
		EvaluationResultHasRunoffCandidates,
		EvaluationResultHasPartialList {
	type: "need-confirmation";
	candidate: string;
	position: number;
}

export interface EvaluationResultListComplete
	extends EvaluationResultCommon,
		EvaluationResultHasPreliminaryLists,
		EvaluationResultHasFinalList,
		EvaluationResultHasRunoffCandidates {
	type: "list-complete";
	messages: EvaluationMessage[];
}

export function hasRunoffCandidates(
	result: EvaluationResult,
): result is EvaluationResultNeedRunoff | EvaluationResultNeedConfirmation | EvaluationResultListComplete {
	return ["list-complete", "need-confirmation", "need-runoff"].includes(result.type);
}

export type EvaluationResult =
	| EvaluationResultNeedLot
	| EvaluationResultNeedRunoff
	| EvaluationResultNeedConfirmation
	| EvaluationResultListComplete;
