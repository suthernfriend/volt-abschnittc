type Name = string;
type Gender = "W/D" | "M/D";
type CandidateDict<V> = { [k: Name]: V };
type CandidateToValue = CandidateDict<number>;
type Vote = CandidateToValue;
type SortedValue = { name: Name, score: number };
type SortedValues = SortedValue[];
type GenderSplit<V> = { [k in Gender]: V };

interface VoteSettingsCandidate {
	abListenplatz: number;
	gender: Gender;
	acceptedElection: boolean;
	wonRunoff: boolean;
	name: string;
}

type VoteSettingsCandidateList = { [k: Name]: VoteSettingsCandidate };

interface VoteSettings {
	candidates: VoteSettingsCandidateList;
	runoffWinner?: Name;
}

function filterCandidateList(candidates: VoteSettingsCandidateList, filter: (candidate: VoteSettingsCandidate) => boolean): VoteSettingsCandidateList {
	const out: VoteSettingsCandidateList = {};

	for (const name in candidates) {
		if (filter(candidates[name]))
			out[name] = candidates[name];
	}

	return out;
}

function ObjectFromEntries<V>(entries: [string, V][]): { [k: string]: V } {
	const out: { [k: string]: V } = {};
	for (const [k, v] of entries)
		out[k] = v;
	return out;
}

function getSettings(sheet: GoogleAppsScript.Spreadsheet.Sheet): VoteSettings {

	log("Loading Settings");

	const columns = sheet.getMaxColumns();
	const rows = sheet.getMaxRows();

	const mapping: { [k in (keyof VoteSettingsCandidate) | "name"]: number } = {
		name: 0,
		abListenplatz: 0,
		wonRunoff: 0,
		gender: 0,
		acceptedElection: 0
	};

	const keys = {
		name: "Name",
		abListenplatz: "Ab Listenplatz",
		wonRunoff: "Runoff gewonnen",
		gender: "Geschlecht",
		acceptedElection: "Wahl angenommen"
	};

	for (let i = 1; i <= columns; i++) {
		const header = sheet.getRange(1, i).getValue();
		switch (header) {
			case keys.name:
				mapping.name = i;
				break;
			case keys.abListenplatz:
				mapping.abListenplatz = i;
				break;
			case keys.gender:
				mapping.gender = i;
				break;
			case keys.wonRunoff:
				mapping.wonRunoff = i;
				break;
			case keys.acceptedElection:
				mapping.acceptedElection = i;
				break;
			default:
				console.warn(`Unknown header ${header}`);
				break;
		}
	}

	const candidates: [string, VoteSettingsCandidate][] = [];

	function validateListenplatz(input: any): number {
		if (typeof input !== "number")
			throw new Error(`Listenplatz is not a number: ${input}`);
		else if (input < 1)
			throw new Error(`Listenplatz is less than 1: ${input}`);
		else
			return input;
	}

	function validateBoolean(name: string, input: any): boolean {
		if (typeof input !== "boolean")
			throw new Error(`${name} is not a boolean: ${input}`);
		else
			return input;
	}

	function validateGender(input: any): Gender {
		if (input !== "W/D" && input !== "M/D")
			throw new Error(`Gender is not W/D or M/D: ${input}`);
		else
			return input;
	}

	for (let i = 2; i <= rows; i++) {
		const name = sheet.getRange(i, mapping.name).getValue();
		candidates.push([
			name,
			{
				wonRunoff: validateBoolean(keys.wonRunoff, sheet.getRange(i, mapping.wonRunoff).getValue()),
				abListenplatz: validateListenplatz(sheet.getRange(i, mapping.abListenplatz).getValue()),
				acceptedElection: validateBoolean(keys.acceptedElection, sheet.getRange(i, mapping.acceptedElection).getValue()),
				gender: validateGender(sheet.getRange(i, mapping.gender).getValue()),
				name
			}
		]);
	}

	function getRunoffWinner() {
		for (const [name, candidate] of candidates) {
			if (candidate.wonRunoff)
				return name;
		}
		return undefined;
	}

	log(`Loaded ${candidates.length} candidates. Runoff winner is ${getRunoffWinner() ?? "not decided"}`);

	return {
		candidates: ObjectFromEntries(candidates),
		runoffWinner: getRunoffWinner()
	};
}

function calculateQuorums(settings: VoteSettings, votes: Vote[]): CandidateToValue {

	const ratio: CandidateDict<{ yes: number, no: number }> = {};
	const output: CandidateToValue = {};

	for (const name in settings.candidates) {
		ratio[name] = { yes: 0, no: 0 };
		output[name] = 0;
	}

	for (const vote of votes) {
		for (const name in vote) {
			if (vote[name] === 0)
				ratio[name].no++;
			else if (vote[name] !== -1)
				ratio[name].yes++;
		}
	}

	for (const name in settings.candidates) {
		const sum = ratio[name].yes + ratio[name].no;
		output[name] = sum > 0 ? ratio[name].yes / sum : 0;
	}

	return output;
}

function loadVotes(sheet: GoogleAppsScript.Spreadsheet.Sheet): Vote[] {

	log("Loading Votes");

	const columns = sheet.getMaxColumns();
	const rows = sheet.getMaxRows();
	const votes: Vote[] = [];

	const titles: string[] = sheet.getRange(1, 1, 1, columns).getValues()[0]
		.map(v => v.toString().trim());

	const range = sheet.getRange(2, 1, rows - 1, columns);
	const values = range.getValues();

	for (let y = 0; y < values.length; y++) {
		const row = values[y];
		const vote: Vote = {};

		for (let x = 0; x < row.length; x++) {
			const name = titles[x];
			const value = row[x];
			vote[name] = Number.parseInt(value);
		}

		if (y % 50 === 0)
			log(`Loaded ${y} of ${values.length} votes`);

		votes.push(vote);
	}

	return votes;
}

function renderPercent(num: number): string {
	return `${Math.floor(num * 10000) / 100} %`;
}

class ResultSheet {
	private readonly lists: [string, any[][]][];

	constructor() {
		this.lists = [];
	}

	public addList(name: string, strs: any[][]): void {
		this.lists.push([name, strs]);
	}

	public write(sheetName: string): void {

		const lines = [...theLog];

		const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
		const newSheet = spreadsheet.insertSheet(sheetName, {});

		newSheet.deleteColumns(2, newSheet.getMaxColumns() - (1 + this.lists.length));
		newSheet.deleteRows(lines.length + 1, newSheet.getMaxRows() - (lines.length + 1));

		newSheet.getRange(1, 1).setValue("Log");

		let i = 2;
		for (const line of lines)
			newSheet.getRange(i++, 1).setValue(line);

		i = 2;
		let j = 2;

		for (const list of this.lists) {

			// title
			newSheet.getRange(1, j).setValue(list[0]);

			let y = 0;
			let maxX = 0;
			for (const v of list[1]) {
				let x = 0;
				for (const r of v) {

					newSheet.getRange(y + i, x + j).setValue(r);
					x++;
				}
				maxX = Math.max(maxX, x);
				y++;
			}

			j += maxX;
		}

		newSheet.autoResizeColumns(1, j - 1);
	}
}

function sortRanks(ranks: CandidateToValue): SortedValues {
	const out: SortedValues = [];

	for (const name in ranks)
		out.push({ name, score: ranks[name] });

	out.sort((a, b) => b.score - a.score);

	return out;
}

//
// function getCalculatedScores(candidates: Name[], votes: Vote[]): CandidateToValue {
//
// 	const calc: CandidateDict<{ sum: number, count: 0 }> = {};
//
// 	for (const name of candidates)
// 		calc[name] = { sum: 0, count: 0 };
//
// 	for (const vote of votes) {
// 		for (const name in vote) {
// 			if (!candidates.includes(name))
// 				continue;
//
// 			if (vote[name] !== -1) {
// 				calc[name].sum += vote[name];
// 				calc[name].count++;
// 			}
// 		}
// 	}
//
// 	const out: CandidateToValue = {};
//
// 	for (const name of candidates) {
// 		if (calc[name].count > 0)
// 			out[name] = calc[name].sum / calc[name].count;
// 	}
//
// 	return out;
// }

function splitByGender(candidateList: VoteSettingsCandidateList, votes: Vote[]): GenderSplit<Vote[]> {
	const out: GenderSplit<Vote[]> = { "W/D": [], "M/D": [] };

	for (const vote of votes) {

		const cur: GenderSplit<CandidateToValue> = { "W/D": {}, "M/D": {} };

		for (const name in candidateList) {
			const candidate = candidateList[name];
			cur[candidate.gender][name] = vote[name];
		}

		out["M/D"].push(cur["M/D"]);
		out["W/D"].push(cur["W/D"]);
	}

	return out;
}

interface RankedCandidate {
	name: string;
	score: number;
	shift: number;
}

function getScores(candidates: Name[], votes: Vote[]): CandidateToValue {
	const sums: CandidateDict<{ sum: number, count: number }> = {};

	for (const name of candidates)
		sums[name] = { sum: 0, count: 0 };

	for (const vote of votes) {
		for (const name of candidates) {
			if (vote[name] !== -1) {
				sums[name].sum += vote[name];
				sums[name].count++;
			}
		}
	}

	const out: CandidateToValue = {};

	for (const name of candidates) {
		if (sums[name].count > 0)
			out[name] = sums[name].sum / sums[name].count;
	}

	return out;
}

function getOneOrMoreHighest(scores: CandidateToValue): string[] {
	const sorted = sortRanks(scores);
	const highest = sorted[0].score;
	const epsilon = 0.000001;
	const out: string[] = [sorted[0].name];

	for (let i = 1; i < sorted.length; i++) {
		if (highest - sorted[i].score < epsilon) {
			out.push(sorted[i].name);
		}
	}

	return out;
}

function getTwoHighest(scores: CandidateToValue, votes: Vote[]): [string, string] {
	const highest = getOneOrMoreHighest(scores);

	function getByTopScoreCountThatIsntEqual(names: Name[]): Name {

		const highest1 = [...names];

		for (let i = 10; i > 0; i--) {
			// für jeden bewerber rausfinden wie viele I stimmen er bekommen hat
			const counts: CandidateToValue = {};

			for (const name of highest1) {
				counts[name] = votes.filter(vote => vote[name] === i).length;
			}

			const next = getOneOrMoreHighest(counts);

			if (next.length > 1) {
				log(`${next.join(", ")} have equal amount of ${i} votes (${counts[next[0]]})`);
				highest1.splice(0, highest1.length, ...next);
			} else
				return next[0];
		}

		log(`${highest1.join(", ")} have equal amount of votes on all points`);

		log(`Tie breaker by coin-flip selection`);

		const winner = getTiebreakerWinner(highest1);
		log(`Coin-Flip decided: ${winner}`);

		if (!winner)
			throw new Error(`Must decide by coin flip: ${highest1.join(", ")}`);
		else
			return winner;
	}

	if (highest.length === 1) {
		log(`Highest is ${highest[0]}`);
		const others = filterRankedCandidates(scores, name => name !== highest[0]);
		const othersHighest = getOneOrMoreHighest(others);

		if (othersHighest.length === 1) {
			log(`2nd highest is ${othersHighest[0]}`);
			return [highest[0], othersHighest[0]];
		} else {
			log(`2nd highest is tied between ${othersHighest.join(", ")}`);
			// tie between 2nd and 3rd (or more)
			const byTopScoreCountThatIsntEqual = getByTopScoreCountThatIsntEqual(othersHighest);
			log(`Tie breaker won by ${byTopScoreCountThatIsntEqual}`);
			return [highest[0], byTopScoreCountThatIsntEqual];
		}
	} else if (highest.length === 2) {
		log(`Highest is tied between ${highest.join(", ")}. But that's ok`);
		return [highest[0], highest[1]];
	} else {
		console.warn(`Highest is tied between ${highest.join(", ")}`);
		// tie between 1st and 2nd (or more)
		const first = getByTopScoreCountThatIsntEqual(highest);
		const others = filterRankedCandidates(scores, name => name !== first);
		const othersHighest = getOneOrMoreHighest(others);

		if (othersHighest.length === 1) {
			log(`2nd highest is ${othersHighest[0]}`);
			return [first, othersHighest[0]];
		} else {
			log(`2nd highest is tied between ${othersHighest.join(", ")}`);
			// tie between 2nd and 3rd (or more)

			const byTopScoreCountThatIsntEqual = getByTopScoreCountThatIsntEqual(othersHighest);
			log(`Tie breaker won by ${byTopScoreCountThatIsntEqual}`);
			return [first, byTopScoreCountThatIsntEqual];
		}
	}
}

function filterRankedCandidates(ranked: CandidateToValue, filter: (name: string) => boolean): CandidateToValue {
	const out: CandidateToValue = {};

	for (const name in ranked) {
		if (filter(name))
			out[name] = ranked[name];
	}

	return out;
}

interface DirectComparisonResult {
	winner: Name;
	loser: Name;
	sumWinner: number;
	sumLoser: number;
}

const tieBreaker: string[][] = [
	// ["Tim Avemarie-Scharmann", "Tilman Schweitzer"],
	// ["Francesca Beyer", "Sascha Heerschop"]
	// ["Möritz, Andre", "Coccejus, Michael", "Schöfmann, Dr. Mark", "Selzer, Philipp"],
	// ["Coccejus, Michael", "Schöfmann, Dr. Mark", "Selzer, Philipp"],
	// ["Schöfmann, Dr. Mark", "Selzer, Philipp"],
	// ["Möritz, Andre", "Coccejus, Michael"],
	// ["Coccejus, Michael", "Schöfmann, Dr. Mark"],
	// ["Nessel, Diane", "Röder, Kathrein Ursula"],
];

function arrayContainsTheSame(a: string[], b: string[]): boolean {
	if (!(Array.isArray(a) &&
		Array.isArray(b) &&
		a.length === b.length))
		return false;

	for (const c of b)
		if (!a.includes(c))
			return false;
	return true;
}

function getTiebreakerWinner(names: string[]): string {
	for (const tie of tieBreaker) {
		if (arrayContainsTheSame(tie, names))
			return tie[0];
	}
	throw new Error(`Must decide by coin flip:\n  ${names.join("\n  ")}`);
}

function directComparison(candidate1: Name, candidate2: Name, votes: Vote[]): DirectComparisonResult {
	let sum1 = 0, sum2 = 0;

	for (const vote of votes) {
		if (vote[candidate1] === -1 || vote[candidate2] === -1)
			continue;

		if (vote[candidate1] > vote[candidate2])
			sum1++;
		else if (vote[candidate2] > vote[candidate1])
			sum2++;
	}

	if (sum1 - sum2 === 0) {

		for (let i = 10; i > 0; i--) {
			// für jeden bewerber rausfinden wie viele I stimmen er bekommen hat
			const count1 = votes.filter(vote => vote[candidate1] === i).length;
			const count2 = votes.filter(vote => vote[candidate2] === i).length;

			if (count1 > count2)
				return { winner: candidate1, loser: candidate2, sumLoser: sum2, sumWinner: sum1 };
			else if (count2 > count1)
				return { winner: candidate2, loser: candidate1, sumLoser: sum1, sumWinner: sum2 };
		}

		log(`Tie breaker by coin-flip selection`);

		const winner = getTiebreakerWinner([candidate1, candidate2]);
		log(`Coin-Flip decided: ${winner}`);

		if (!winner)
			throw new Error(`Must decide by coin flip: ${[candidate1, candidate2].join(", ")}`);
		else {
			const sumWinner = winner === candidate1 ? sum1 : sum2;
			const sumLoser = winner === candidate1 ? sum2 : sum1;
			return { winner: winner, loser: winner === candidate1 ? candidate2 : candidate1, sumLoser, sumWinner };
		}
	} else {
		if (sum1 - sum2 > 0)
			return { winner: candidate1, loser: candidate2, sumLoser: sum2, sumWinner: sum1 };
		else
			return { winner: candidate2, loser: candidate1, sumLoser: sum1, sumWinner: sum2 };
	}
}

function rankCandidates(candidateList: VoteSettingsCandidateList, votes: Vote[]): RankedCandidate[] {

	const shift: CandidateDict<number> = {};
	for (const name in candidateList)
		shift[name] = 0;

	const allScores = getScores(Object.keys(candidateList), votes);
	const out: RankedCandidate[] = [];
	const input = Object.keys(candidateList);

	while (input.length > 0) {

		// get score
		const scores = filterRankedCandidates(allScores, name => input.includes(name));
		const count = Object.keys(scores).length;

		if (count === 1) {
			out.push({ name: input[0], score: scores[input[0]], shift: shift[input[0]] });
			input.splice(0, 1);
		} else {
			const [first, second] = getTwoHighest(scores, votes);

			// check direct comparison
			const compared = directComparison(first, second, votes);

			if (compared.winner === first) {
				log(`${first} wins against ${second} in direct comparison (${first} ${compared.sumWinner} ${second} ${compared.sumLoser}})`);
				out.push({ name: first, score: scores[first], shift: shift[first] });
				input.splice(input.indexOf(first), 1);
			} else {
				log(`${second} wins against ${first} in direct comparison (${second} ${compared.sumWinner} ${first} ${compared.sumLoser}})`);
				shift[compared.loser]++;
				out.push({ name: second, score: scores[second], shift: shift[second] });
				input.splice(input.indexOf(second), 1);
			}
		}
	}

	return out;
}

const theLog: string[] = [];

function log(str: string) {
	console.log(str);
	theLog.push(str);
}

function getRunoffCandidate(candidateList: VoteSettingsCandidateList, ranked: RankedCandidate[], force: boolean): string | undefined {

	if (!force) {
		for (const candidate of ranked) {
			const settings = candidateList[candidate.name];

			if (settings.abListenplatz === 1)
				return candidate.name;
		}

		return undefined;
	} else {

		let maxListenplatz = 100;
		let minListenplatz = 1;

		while (minListenplatz < maxListenplatz) {
			for (const candidate of ranked) {
				const settings = candidateList[candidate.name];

				if (settings.abListenplatz === minListenplatz)
					return candidate.name;
			}

			minListenplatz++;
		}

		throw new Error("No candidate found");
	}
}

function getRunoffCandidates(candidateList: VoteSettingsCandidateList, ranked: GenderSplit<RankedCandidate[]>): string[] {

	const candidateMd = getRunoffCandidate(candidateList, ranked["M/D"], false);
	const candidateWd = getRunoffCandidate(candidateList, ranked["W/D"], false);

	if (candidateMd !== undefined && candidateWd !== undefined) {
		log(`Two candidates run for spot 1`);
		return [candidateMd, candidateWd];
	} else {
		log(`One list doesn't specify candidate for runoff. Enforcing`);
		return [getRunoffCandidate(candidateList, ranked["M/D"], true)!, getRunoffCandidate(candidateList, ranked["W/D"], true)!];
	}
}

function mergeList(candidateList: VoteSettingsCandidateList, rankedListMd: RankedCandidate[], rankedListWd: RankedCandidate[], winner: string)
	: RankedCandidate[] {


	let listenplatz = 2;
	const out: RankedCandidate[] = [];

	let winnerMd = rankedListMd.find(candidate => candidate.name === winner);
	let winnerWd = rankedListWd.find(candidate => candidate.name === winner);
	if (winnerMd) {
		rankedListMd.splice(rankedListMd.indexOf(winnerMd), 1);
		out.push(winnerMd);
	} else if (winnerWd) {
		rankedListWd.splice(rankedListMd.indexOf(winnerWd), 1);
		out.push(winnerWd);
	}

	let nextIsMd = !winnerMd;

	while (rankedListMd.length > 0 || rankedListWd.length > 0) {

		const nextList = nextIsMd ? rankedListMd : rankedListWd;

		if (nextList.length === 0) {
			nextIsMd = !nextIsMd;
			continue;
		}

		log(`Next Listenplatz is ${listenplatz}, from ${nextIsMd ? "M/D" : "W/D"} list`);

		let minListenplatz = listenplatz;
		let found = false;

		while (minListenplatz < 1000) {
			for (let i = 0; i < nextList.length; i++) {
				const abListenplatz = candidateList[nextList[i].name].abListenplatz;

				if (abListenplatz <= minListenplatz) {
					log(`Candidate ${nextList[i].name} is on spot ${abListenplatz} (runs from listenplatz ${abListenplatz})`);
					out.push({ name: nextList[i].name, score: nextList[i].score, shift: nextList[i].shift });
					nextList.splice(i, 1);
					found = true;
					break;
				}

			}

			if (found) {
				listenplatz++;
				nextIsMd = !nextIsMd;
				break;
			} else {
				minListenplatz++;
				log(`No candidate from ${nextIsMd ? "M/D" : "W/D"} list found for listenplatz ${listenplatz}, increasing min to ${minListenplatz}`);
			}
		}
	}

	return out;
}

function calculate(): void {

	const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
	const bewerberSheet = spreadsheet.getSheetByName("Bewerber")!;
	const votesSheet = spreadsheet.getSheetByName("Eingabe")!;

	const result = new ResultSheet();

	const settings = getSettings(bewerberSheet);
	const votes = loadVotes(votesSheet);

	log(`Total Candidates: ${Object.keys(settings.candidates).length}`);
	log(`Total Votes processed: ${votes.length}`);

	log("---");

	// do quorum
	const quorums = calculateQuorums(settings, votes);
	const failed: string[] = [];

	for (const name in quorums) {
		if (quorums[name] > 0.5)
			log(`${name} passed the quorum with ${renderPercent(quorums[name])}`);
		else {
			failed.push(name);
			log(`${name} failed the quorum with ${renderPercent(quorums[name])}`);
		}
	}

	log("---");

	try {

		const filteredCandidates = filterCandidateList(settings.candidates, candidate =>
			!failed.includes(candidate.name));

		log(`${failed.length} candidates failed the quorum and are eliminated`);

		// create preliminary lists
		const seperated = splitByGender(filteredCandidates, votes);
		const ranked: GenderSplit<RankedCandidate[]> = { "M/D": [], "W/D": [] };

		for (const gender of ["M/D", "W/D"] satisfies Gender[]) {
			const byGender = filterCandidateList(filteredCandidates, candidate => candidate.gender === gender);

			const votes = seperated[gender];
			ranked[gender] = rankCandidates(byGender, votes);

			result.addList(`${gender} Preliminary`, ranked[gender].map(candidate => {
				return [`${candidate.name}`, candidate.score, -1 * candidate.shift, filteredCandidates[candidate.name].abListenplatz];
			}));
		}

		log("---");

		const winner = settings.runoffWinner;
		if (winner === undefined) {

			log("Runoff undecided: Runoff must take place between the following candidates");
			const runoffCandidates = getRunoffCandidates(filteredCandidates, ranked);
			log(`Runoff candidates: ${runoffCandidates.join(", ")}`);

		} else {
			log(`Runoff winner is ${winner}`);

			const final = mergeList(filteredCandidates, ranked["M/D"], ranked["W/D"], winner);

			let i = 0;
			result.addList("Final", final.map(candidate => {
				return [++i, `${candidate.name}`, candidate.score, -1 * candidate.shift, filteredCandidates[candidate.name].abListenplatz];
			}));
		}
	} catch (e) {
		log(`Runoff undecided: ${e.message}`);
	} finally {
		result.write(`Result ${new Date().toISOString()}`);
	}
}
