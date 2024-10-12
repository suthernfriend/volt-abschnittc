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
	created: string;
	rankings: { [candidateId: string]: number };
}

export function voteEquals(a: Vote, b: Vote): boolean {
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

export function arrayEquals<T>(a: T[], b: T[]): boolean {
	if (a.length !== b.length) {
		return false;
	}

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) {
			return false;
		}
	}

	return true;
}

export interface VoteDiffEntryMissingCandidate {
	type: "missing-candidate";
	in: "a" | "b";
	candidateId: string;
}

export interface VoteDiffEntryPointsMissmatch {
	type: "points-missmatch";
	candidateId: string;
	pointsA: number;
	pointsB: number;
}

export type VoteDiffEntry = VoteDiffEntryMissingCandidate | VoteDiffEntryPointsMissmatch;

export function voteDiff(a: Vote, b: Vote): VoteDiffEntry[] {
	const out: VoteDiffEntry[] = [];

	const aKeys = Object.keys(a.rankings).sort();
	const bKeys = Object.keys(b.rankings).sort();
	const allKeys = [...new Set([...aKeys, ...bKeys])].sort();

	if (!arrayEquals(aKeys, bKeys)) {

		for (const key of allKeys) {
			if (!a.rankings[key]) {
				out.push({ type: "missing-candidate", in: "a", candidateId: key });
			} else if (!b.rankings[key]) {
				out.push({ type: "missing-candidate", in: "b", candidateId: key });
			}
		}

	}

	for (const key of allKeys) {
		if (a.rankings[key] !== b.rankings[key]) {
			if (a.rankings[key] !== undefined && b.rankings[key] !== undefined) {
				out.push({
					type: "points-missmatch",
					candidateId: key,
					pointsA: a.rankings[key],
					pointsB: b.rankings[key]
				});
			}
		}
	}

	return out;
}

export interface Election {
	id: string;
	countingCommission: string[];
	lead: string;
	candidates: Candidate[];
	counts: {
		male: Vote[];
		female: Vote[];
	};
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

