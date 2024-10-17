import type { Candidate } from "@/lib/Types";
import type { ListCompleteResult, NeedRunoffResult } from "@/lib/Evaluation";

export type PageSizeNames = "A42" | "A41" | "2A4" | "A32" | "A31";

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

export interface BallotGenerator {
	ballot241(ballot241: Ballot241): Promise<ArrayBuffer>;

	ballot242(ballot242: Ballot242): Promise<ArrayBuffer>;

	result241(needRunoffResult: NeedRunoffResult | ListCompleteResult): Promise<ArrayBuffer>;

	result242(needRunoffResult: NeedRunoffResult): Promise<ArrayBuffer>;
}
