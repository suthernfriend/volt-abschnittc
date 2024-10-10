export interface Candidate {
	id: string;
	title?: string;
	firstName: string;
	lastName: string;
	list: "male" | "female";
	extra?: string;
	minSpot: number;
}

export function renderCandidateName(candidate: Candidate) {

	const output = [];

	if (candidate.title) {
		output.push(candidate.title);
	}

	output.push(candidate.firstName);
	output.push(candidate.lastName);

	if (candidate.extra) {
		output.push(candidate.extra);
	}

	return output.join(" ");
}

export interface Vote {
	ballotId: string;
	created: Date;
	rankings: { [candidateId: string]: number };
}

export interface Election {
	id: string;
	countingCommission: string[];
	lead: string;
	candidates: Candidate[];
	counts: {
		male: Vote[];
		female: Vote[];
	}
}

export function sortCandidates(candidates: Candidate[]): Candidate[] {
	return candidates.sort(candidateSort);
}

export function candidateSort(a: Candidate, b: Candidate): number {
	if (a.minSpot !== b.minSpot) {
		return a.minSpot - b.minSpot;
	} else if (a.lastName !== b.lastName) {
		return a.lastName.localeCompare(b.lastName);
	} else if (a.firstName !== b.firstName) {
		return a.firstName.localeCompare(b.firstName);
	} else if (a.extra !== b.extra) {
		if (!a.extra) {
			return -1;
		} else if (!b.extra) {
			return 1;
		} else {
			return a.extra.localeCompare(b.extra);
		}
	} else {
		return 0;
	}
}

export interface Ballot {
	id: string;
	candidates: Candidate[];
}

