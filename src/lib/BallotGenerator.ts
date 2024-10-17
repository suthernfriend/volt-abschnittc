import type { Candidate, ElectionBallotIds } from "@/lib/Types";
import type { ListCompleteResult, NeedRunoffResult } from "@/lib/Evaluation";

export type PageSizeNames = "A4_2" | "A4" | "2_A4" | "A3_2" | "A3_3";

export interface Ballot241 {
	candidates: Candidate[];
	electionName: string;
	assemblyName: string;
	pageSize: PageSizeNames;
	uniqueId: string;
}

export interface Ballot242 {
	candidate1: Candidate;
	candidate2: Candidate;
	electionName: string;
	assemblyName: string;
	pageSize: PageSizeNames;
	uniqueId: string;
}

export interface ResultComplete {
	electionName: string;
	assemblyName: string;
	result: ListCompleteResult
	uniqueIds: ElectionBallotIds;
}

export interface BallotGenerator {
	ballot241(ballot241: Ballot241): Promise<ArrayBuffer>;

	ballot242(ballot242: Ballot242): Promise<ArrayBuffer>;

	resultComplete(result: ResultComplete): Promise<ArrayBuffer>;
}
