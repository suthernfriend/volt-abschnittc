import type { Candidate, ElectionBallotIds } from "@/lib/Types";
import type { ListCompleteResult, NeedRunoffResult } from "@/lib/Evaluation";

export type PageSizeNames = "A4_2" | "A4" | "2_A4" | "A3_2" | "A3_3";

export interface Ballot232 {
	candidates: Candidate[];
	electionName: string;
	assemblyName: string;
	maxPoints: number;
	pageSize: PageSizeNames;
	uniqueId: string;
}

export interface Ballot19 {
	candidate1: Candidate;
	candidate2: Candidate;
	nth: number;
	electionName: string;
	assemblyName: string;
	pageSize: PageSizeNames;
	uniqueId: string;
}

export interface ResultComplete {
	electionName: string;
	assemblyName: string;
	candidates: Candidate[];
	result: ListCompleteResult;
	uniqueIds: ElectionBallotIds;
}

export interface BallotGenerator {
	ballot232(ballot232: Ballot232): Promise<ArrayBuffer>;

	ballot19(ballot19: Ballot19): Promise<ArrayBuffer>;

	resultComplete(result: ResultComplete): Promise<ArrayBuffer>;
}
