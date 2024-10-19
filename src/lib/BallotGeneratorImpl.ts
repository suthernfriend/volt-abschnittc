import type { Ballot19, Ballot232, BallotGenerator, PageSizeNames, ResultComplete } from "@/lib/BallotGenerator";
import { pdfDocumentManager } from "@/pdflib2/PdfDocumentManager";
import { pdfVirtualWriter } from "@/pdflib2/PdfBufferedVirtualWriter";
import { PdfGeometries, type PdfPageGeometry } from "@/pdflib2/PdfGeometries";
import { color } from "@/pdflib2/PdfColor";
import { electionGenderString, renderCandidateName, sortCandidates } from "@/lib/Types";
import { objectGroup, type PdfObjectGroup } from "@/pdflib2/PdfObjectGroup";
import { centeredText, mapMultilineText, multilineText, rightAlignedText } from "@/pdflib2/PdfText";
import { root, vector2d } from "@/pdflib2/Vector2d";
import { whitespace } from "@/pdflib2/PdfWhitespace";
import { strokeRect } from "@/pdflib2/PdfRectangle";
import type {
	EvaluationMessageCombined,
	EvaluationMessagePreliminaryList,
	EvaluationMessageRunoff,
	EvaluationMessageRunoffCandidates,
	EvaluationMessageTroublemakers
} from "@/lib/EvaluationMessage";
import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import type { TextProvider } from "@/lib/TextProvider";

export interface BallotGeneratorImplOptions {
	textProvider: TextProvider;
}

export class BallotGeneratorImpl implements BallotGenerator {

	constructor(private options: BallotGeneratorImplOptions) {
	}

	static toGeometry(pageSize: PageSizeNames): PdfPageGeometry {
		switch (pageSize) {
			case "A4_2":
				return PdfGeometries.A4L_2;
			case "A4":
				return PdfGeometries.A4;
			case "2_A4":
				throw new Error("Not implemented");
			case "A3_2":
				return PdfGeometries.A3L_2;
			case "A3_3":
				return PdfGeometries.A3L_3;
			default:
				throw new Error(`Unknown page size ${pageSize}`);
		}
	}

	async getAssets() {
		const UbuntuR = (await import("@/fonts/Ubuntu-R.ttf?arraybuffer")).default;
		const UbuntuRI = (await import("@/fonts/Ubuntu-RI.ttf?arraybuffer")).default;
		const UbuntuB = (await import("@/fonts/Ubuntu-B.ttf?arraybuffer")).default;
		const VoltLogo = (await import("@/assets/logo-dark.png?arraybuffer")).default;

		return { UbuntuR, UbuntuRI, UbuntuB, VoltLogo };
	}

	async ballot19(ballot19: Ballot19): Promise<ArrayBuffer> {
		const manager = pdfDocumentManager();
		const document = await manager.create();

		const { UbuntuR, UbuntuRI, UbuntuB, VoltLogo } = await this.getAssets();

		console.log(UbuntuR, UbuntuB, VoltLogo);

		const regularFont = await document.addFont(UbuntuR);
		const boldFont = await document.addFont(UbuntuB);
		const voltLogo = await document.addImage(VoltLogo, "png");
		const black = color(0, 0, 0);

		const geometry = BallotGeneratorImpl.toGeometry(ballot19.pageSize);

		const writer = pdfVirtualWriter(geometry.padding(5, 5, 5, 5));

		const maxWidth = writer.safeGeometryWidth();
		const headerTitleWidth = maxWidth * 0.7;
		const headerLogoWidth = maxWidth - headerTitleWidth;
		const voltHeaderLogo = voltLogo.atWidth(headerLogoWidth - 5);

		const tg = this.options.textProvider.group("19");

		const headerGroup = objectGroup()
			.addRelative(voltHeaderLogo, vector2d(headerTitleWidth + 5, 0))
			.addRelative(
				rightAlignedText(ballot19.uniqueId, boldFont.atSize(9), black, voltHeaderLogo.size().width()),
				vector2d(headerTitleWidth + 5, voltHeaderLogo.size().height())
			)
			.addFlow(multilineText(tg.get("tite").get(), regularFont.atSize(14), black, headerTitleWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(ballot19.electionName, regularFont.atSize(10), black, headerTitleWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(tg.get("explainer").get(), regularFont.atSize(8), black, maxWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(tg.get("instruction").get(), regularFont.atSize(9), black, maxWidth))
			.addFlow(whitespace(vector2d(0, 10)));

		writer.addObject(headerGroup);

		writer.complete(document);

		return await manager.exportAsArrayBuffer(document);
	}

	async ballot232(ballot232: Ballot232): Promise<ArrayBuffer> {
		const manager = pdfDocumentManager();
		const document = await manager.create();

		const { UbuntuR, UbuntuRI, UbuntuB, VoltLogo } = await this.getAssets();

		console.log(UbuntuR, UbuntuB, VoltLogo);

		const regularFont = await document.addFont(UbuntuR);
		const boldFont = await document.addFont(UbuntuB);
		const voltLogo = await document.addImage(VoltLogo, "png");
		const black = color(0, 0, 0);

		const geometry = BallotGeneratorImpl.toGeometry(ballot232.pageSize);

		const writer = pdfVirtualWriter(geometry.padding(5, 5, 5, 5));
				const textGroup = this.options.textProvider.group("232");

		const texts = {
			text: textGroup.get("title").set("assemblyName", ballot232.assemblyName).get(),
			explainer: textGroup.get("explainer")
				.set("maxPoints", ballot232.maxPoints).get(),
			instruction: textGroup.get("instruction")
				.set("maxPoints", ballot232.maxPoints).get()
		};


		const maxWidth = writer.safeGeometryWidth();
		const headerTitleWidth = maxWidth * 0.7;
		const headerLogoWidth = maxWidth - headerTitleWidth;
		const voltHeaderLogo = voltLogo.atWidth(headerLogoWidth - 5);

		const headerGroup = objectGroup()
			.addRelative(voltHeaderLogo, vector2d(headerTitleWidth + 5, 0))
			.addRelative(
				rightAlignedText(ballot232.uniqueId, boldFont.atSize(9), black, voltHeaderLogo.size().width()),
				vector2d(headerTitleWidth + 5, voltHeaderLogo.size().height())
			)
			.addFlow(multilineText(texts.text, regularFont.atSize(14), black, headerTitleWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(ballot232.electionName, regularFont.atSize(10), black, headerTitleWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(texts.explainer, regularFont.atSize(8), black, maxWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(texts.instruction, regularFont.atSize(9), black, maxWidth))
			.addFlow(whitespace(vector2d(0, 10)));

		writer.addObject(headerGroup);

		const candidates = sortCandidates(ballot232.candidates);

		let lastMinSpot = 0;

		const candidateWidth = maxWidth * (1 / 3);
		const pointsWidth = candidateWidth * 2;
		const boxWidth = 4;

		for (let i = 0; i < candidates.length; i++) {
			const candidate = candidates[i];

			const boxes = 10;
			const boxSpacing = (pointsWidth - (boxes + 1) * boxWidth) / 10;
			const boxOffsets: number[] = [];
			for (let j = 0; j <= boxes; j++) {
				boxOffsets.push(candidateWidth + j * (boxWidth + boxSpacing));
			}

			const group = objectGroup();

			if (candidate.minSpot !== lastMinSpot) {
				const innerGroup = objectGroup();

				const text = textGroup
					.get("fromListenplatz")
					.set("spot", candidate.minSpot).get();

				innerGroup
					.addFlow(centeredText(text, boldFont.atSize(8), black, vector2d(candidateWidth, 5)))
					.addFlow(whitespace(vector2d(0, 2)));

				const no = textGroup.get("no").get();

				for (let j = 0; j <= boxes; j++) {
					const text = j === 0 ? "0 | " + no : `${j}`;

					innerGroup.addRelative(
						centeredText(text, regularFont.atSize(8), black, vector2d(boxWidth, 5)),
						vector2d(boxOffsets[j], 0)
					);
				}

				group.addFlow(innerGroup);

				lastMinSpot = candidate.minSpot;
			}

			const outerGroup = objectGroup();

			outerGroup
				.addFlow(multilineText(renderCandidateName(candidate), regularFont.atSize(10), black, candidateWidth))
				.addRelative(whitespace(vector2d(0, 9)), root());

			for (let j = 0; j <= boxes; j++) {
				outerGroup.addRelative(strokeRect(vector2d(boxWidth, boxWidth), 1, black), vector2d(boxOffsets[j], 0));
			}

			group.addFlow(outerGroup);

			writer.addObject(group);
		}

		writer.complete(document);

		return await manager.exportAsArrayBuffer(document);
	}

	async resultComplete(result: ResultComplete): Promise<ArrayBuffer> {
		const manager = pdfDocumentManager();
		const document = await manager.create();
		const tg = this.options.textProvider.group("resultComplete");

		const { UbuntuR, UbuntuB, UbuntuRI } = await this.getAssets();

		const regularFont = await document.addFont(UbuntuR);
		const boldFont = await document.addFont(UbuntuB);
		const italicFont = await document.addFont(UbuntuRI);
		const black = color(0, 0, 0);

		const geometry = PdfGeometries.A4;

		const writer = pdfVirtualWriter(geometry.padding(15, 20, 15, 20));

		const maxWidth = writer.safeGeometryWidth();

		writer
			.addObject(multilineText(tg.get("title")
						.set("electionName", result.electionName)
						.set("assemblyName", result.assemblyName).get(),
					boldFont.atSize(14),
					black,
					maxWidth
				)
			)
			.addObject(whitespace(vector2d(0, 7)));

		writer
			.addObject(multilineText(tg.get("subtitle").get(),
				regularFont.atSize(12), black, maxWidth))
			.addObject(whitespace(vector2d(0, 7)));

		const textMapper = mapMultilineText(regularFont.atSize(9), black, maxWidth);
		const boldMapper = mapMultilineText(boldFont.atSize(9), black, maxWidth);


		for (const message of result.result.messages) {
			switch (message.type) {
				case "vote-count":
					const tgvc = tg.sub("voteCount");

					writer
						.addObject(textMapper(tgvc.get("total").set("count", message.count).get()))
						.addObject(whitespace(vector2d(0, 1)))
						.addObject(textMapper(tgvc.get("count", "male").set("count", message.male).get()))
						.addObject(textMapper(tgvc.get("count", "female").set("count", message.female).get()));
					break;
				case "troublemakers":
					const tgt = tg.sub("troublemakers");
					writer
						.addObject(multilineText(tgt.get("title").get(), boldFont.atSize(12), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObject(multilineText(tgt.get("explainer").get(), italicFont.atSize(8), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObjects(this.troublemakers(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 5)));
					break;
				case "preliminary-list":
					const tgp = tg.sub("preliminaryList");
					writer
						.addObject(multilineText(tgp.get("title", message.list).get(),
							boldFont.atSize(12), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObject(multilineText(tgp.get("explainer").get(), italicFont.atSize(8), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)));

					const ga = objectGroup()
						.addFlow(boldMapper(tgp.get("overview").get()))
						.addFlow(whitespace(vector2d(0, 3)));

					const pl = result.result.preliminaryLists[message.list];

					const sorted = [...pl].sort((a, b) => b.score - a.score);

					for (const onList of sorted) {
						const candidate = result.candidates.find((c) => c.id === onList.candidateId)!;
						ga.addFlow(
							objectGroup()
								.addFlow(textMapper(renderCandidateName(candidate)))
								.addRelative(textMapper(
									tgp.get("average").set("score", this.round4Digits(onList.score)).get()), vector2d(maxWidth * 0.45, 0))
						);
					}

					ga.addFlow(whitespace(vector2d(0, 5)));

					writer
						.addObject(ga)
						.addObjects(this.preliminaryList(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 3)));

					const gg = objectGroup();
					gg.addFlow(boldMapper(tgp.get("summary", message.list).get()))
						.addFlow(whitespace(vector2d(0, 3)));

					for (const entry of pl) {
						const name = BallotGeneratorImpl.candidateNameById(result, entry.candidateId);

						gg.addFlow(
							objectGroup()
								.addFlow(boldMapper(tgp.get("spot").set("position", entry.position).get()))
								.addRelative(textMapper(name), vector2d(maxWidth * 0.15, 0))
								.addRelative(
									textMapper(tgp.get("average").set("score", this.round4Digits(entry.score)).get()),
									vector2d(maxWidth * 0.45, 0)
								)
								.addRelative(textMapper(
									tgp.get("shift").set("shift", -entry.shift).get()),
									vector2d(maxWidth * 0.65, 0))
						);
					}

					gg.addFlow(whitespace(vector2d(0, 5)));

					writer.addObject(gg);

					break;
				case "runoff-candidates":
					const tgrc = tg.sub("runoffCandidates");
					writer
						.addObject(multilineText(tgrc.get("title").get(),
							boldFont.atSize(12), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObject(multilineText(tgrc.get("explainer").get(), italicFont.atSize(8), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObjects(this.runoffCandidates(result, textMapper, boldMapper, message, maxWidth))
						.addObject(whitespace(vector2d(0, 5)));
					break;
				case "runoff":
					const tgr = tg.sub("runoff");
					writer
						.addObject(multilineText(tgr.get("title").get(),
							boldFont.atSize(12), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObject(multilineText(tgr.get("explainer").get(), italicFont.atSize(8), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObjects(this.runoff(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 5)));
					break;
				case "combined":
					const tgc = tg.sub("combined");
					writer
						.addObject(multilineText(tgc.get("title").get(),
								boldFont.atSize(12),
								black,
								maxWidth
							)
						)
						.addObjects(this.combined(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 5)));
					break;
			}
		}

		writer.complete(document);

		return await manager.exportAsArrayBuffer(document);
	}

	static candidateNameById(result: ResultComplete, id: string): string {
		for (const candidate of result.candidates) {
			if (candidate.id === id) {
				return renderCandidateName(candidate);
			}
		}

		throw new Error(`Candidate with id ${id} not found`);
	}

	preliminaryList(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessagePreliminaryList
	): Pdf2DObject[] {
		const out: Pdf2DObject[] = [];
		const tg = this.options.textProvider.group("resultComplete.preliminaryList");

		for (const m of message.messages) {
			const group = objectGroup();

			if (m.type === "preliminary-list-spot-duo") {
				const winnerName = BallotGeneratorImpl.candidateNameById(result, m.winner.candidateId);
				const loserName = BallotGeneratorImpl.candidateNameById(result, m.loser.candidateId);

				group
					.addFlow(boldMapper(tg.get("titleSpot", message.list)
						.set("position", m.position)
						.get()))
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(textMapper(
						tg.get("highestRankedForSpot").set("winnerName", winnerName).set("loserName", loserName).get()))
					.addFlow(textMapper(tg.get("spotScoreWinner")
						.set("winnerName", winnerName)
						.set("winnerScore", this.round4Digits(m.winner.score)).get()))
					.addFlow(textMapper(tg.get("spotScoreLoser")
						.set("loserName", loserName)
						.set("loserScore", this.round4Digits(m.loser.score)).get()))
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(textMapper(tg.get("directComparisonExcluded")
						.set("count", m.directComparisonExcludedBallots).get()))
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(textMapper(tg.get("directComparisonWinner")
						.set("winnerName", winnerName)
						.set("count", m.winner.directComparisonBallots).get()))
					.addFlow(textMapper(tg.get("directComparisonLoser")
						.set("loserName", winnerName)
						.set("count", m.loser.directComparisonBallots).get()))
					.addFlow(whitespace(vector2d(0, 1)));

				if (m.directComparisonTieBreaker && m.directComparisonTieBreaker.length > 0) {
					group
						.addFlow(textMapper(tg.get("directComparisonTieBreaker").get()))
						.addFlow(whitespace(vector2d(0, 1)));

					for (const msg of m.directComparisonTieBreaker) {
						const ccs = Object.entries(msg.counts).map((v) =>
							tg.get("directComparisonTieBreakerPoints")
								.set("name", BallotGeneratorImpl.candidateNameById(result, v[0]))
								.set("count", v[1])
								.set("points", msg.points).get());
						for (const mm of ccs) {
							group.addFlow(textMapper(mm));
						}
						group.addFlow(whitespace(vector2d(0, 1)));
					}
				}

				group
					.addFlow(boldMapper(tg.get("spotResult", message.list)
						.set("winnerName", winnerName).set("spot", m.position).get()))
					.addFlow(whitespace(vector2d(0, 3)));
			} else if (m.type === "preliminary-list-spot-single") {
				let lastCdName = BallotGeneratorImpl.candidateNameById(result, m.candidateId);
				group
					.addFlow(boldMapper(tg.get("titleSpot", message.list)
						.set("position", m.position)
						.get()))
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(textMapper(tg.get("lastExpl")
						.set("name", lastCdName).get()))
					.addFlow(boldMapper(tg.get("spotResult", message.list)
						.set("winnerName", lastCdName).set("spot", m.position).get()))
					.addFlow(whitespace(vector2d(0, 3)));
			}

			out.push(group);
		}

		return out;
	}

	round4Digits(value: number): number {
		return Math.round(value * 10000) / 10000;
	}

	runoffCandidates(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessageRunoffCandidates,
		maxWidth: number
	): Pdf2DObject[] {

		const tg = this.options.textProvider.group("resultComplete.runoffCandidates");

		const maleCandidateName = BallotGeneratorImpl.candidateNameById(result, message.maleCandidate.candidateId);
		const femaleCandidateName = BallotGeneratorImpl.candidateNameById(result, message.femaleCandidate.candidateId);

		const group = objectGroup();

		group
			.addFlow(textMapper(tg.get("subtitle").get()))
			.addFlow(whitespace(vector2d(0, 1)))
			.addFlow(
				objectGroup()
					.addFlow(textMapper(`1.`))
					.addRelative(boldMapper(maleCandidateName), vector2d(7, 0))
					.addRelative(textMapper(tg.get("afterName", "male").get()),
						vector2d(maxWidth * 0.25, 0)))
			.addFlow(
				objectGroup().addFlow(textMapper(`2.`))
					.addRelative(boldMapper(femaleCandidateName), vector2d(7, 0))
					.addRelative(textMapper(tg.get("afterName", "female").get()),
						vector2d(maxWidth * 0.25, 0)));

		return [group];
	}

	 	runoff(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessageRunoff
	): Pdf2DObject[] {
		return [];
	}

	combined(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessageCombined
	): Pdf2DObject[] {
		return [];
	}

	troublemakers(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessageTroublemakers
	): Pdf2DObject[] {
		const out: Pdf2DObject[] = [];

		const tgt = this.options.textProvider.group("resultComplete.troublemakers");

		const cds = sortCandidates(message.candidates.map((c) => result.candidates.find((cc) => cc.id === c.candidateId)!));

		for (const cdid of cds) {
			const tc = message.candidates.find((c) => c.candidateId === cdid.id)!;

			const group = objectGroup();

			const candidate = result.candidates.find((c) => c.id === tc.candidateId)!;
			const name = renderCandidateName(candidate);
			const listString = electionGenderString(candidate.list);
			group.addFlow([
				textMapper(tgt.get("expl1", "female")
					.set("name", name).get()),
				textMapper(tgt.get("nullVotes").set("count", tc.nullVotes).get()),
				textMapper(tgt.get("nonNullVotes").set("count", tc.nullVotes).get()),
				whitespace(vector2d(0, 1))
			]);

			if (tc.passed) group.addFlow(boldMapper(tgt.get("ok").set("name", name).get()));
			else group.addFlow(boldMapper(tgt.get("notOk").set("name", name).get()));
			group.addFlow(whitespace(vector2d(0, 3)));

			out.push(group);
		}

		return out;
	}
}
