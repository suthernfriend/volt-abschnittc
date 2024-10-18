import type { Ballot241, Ballot242, BallotGenerator, PageSizeNames, ResultComplete } from "@/lib/BallotGenerator";
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
	EvaluationMessageTroublemakers,
	EvaluationMessageVoteCount,
} from "@/lib/EvaluationMessage";
import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";

export class BallotGeneratorImpl implements BallotGenerator {
	text241(assemblyName: string, maxPoints: number) {
		const text = `Stimmzettel für ${assemblyName}`;

		const explainer =
			`Die Wahl erfolgt gemäß § 23 der Allgemeinen Wahlordnung von Volt Deutschland. Jedem Bewerber kann ` +
			`dabei eine Punktzahl zwischen 0 und 5 vergeben werden. Punktzahlen können mehrfach vergeben werden. ` +
			`Die Reihenfolge ergibt sich durch den Mittelwert der vergebenen Punktzahlen, wobei die Bewerber jeweils ` +
			`nochmal im direkten Vergleich verglichen werden. Enthaltungen werden als nicht abgegebene Stimmen ` +
			`gezählt und werden durch leere Felder angezeigt. Bewerber die von mehr als der Hälfte der ` +
			`Stimmberechtigten mit 0 Punkten bewertet werden, sind nicht für die Liste zugelassen.`;

		const instruction = `Sie können bei jedem Bewerber / jeder Bewerberin eine Punktzahl zwischen 0 und ${maxPoints} vergeben.`;

		return {
			text,
			explainer,
			instruction,
		};
	}

	static toGeometry(pageSize: PageSizeNames): PdfPageGeometry {
		switch (pageSize) {
			case "A4_2":
				return PdfGeometries.A4L_2;
			case "A4":
				return PdfGeometries.A4;
			case "2_A4":
				throw new Error("Jan hat noch nicht fertig.");
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

	async ballot241(ballot241: Ballot241): Promise<ArrayBuffer> {
		const manager = pdfDocumentManager();
		const document = await manager.create();

		const { UbuntuR, UbuntuRI, UbuntuB, VoltLogo } = await this.getAssets();

		console.log(UbuntuR, UbuntuB, VoltLogo);

		const regularFont = await document.addFont(UbuntuR);
		const boldFont = await document.addFont(UbuntuB);
		const voltLogo = await document.addImage(VoltLogo, "png");
		const black = color(0, 0, 0);

		const geometry = BallotGeneratorImpl.toGeometry(ballot241.pageSize);

		const writer = pdfVirtualWriter(geometry.padding(5, 5, 5, 5));

		const texts = this.text241(ballot241.assemblyName, 5);

		const maxWidth = writer.safeGeometryWidth();
		const headerTitleWidth = maxWidth * 0.7;
		const headerLogoWidth = maxWidth - headerTitleWidth;
		const voltHeaderLogo = voltLogo.atWidth(headerLogoWidth - 5);

		const headerGroup = objectGroup()
			.addRelative(voltHeaderLogo, vector2d(headerTitleWidth + 5, 0))
			.addRelative(
				rightAlignedText(ballot241.uniqueId, boldFont.atSize(9), black, voltHeaderLogo.size().width()),
				vector2d(headerTitleWidth + 5, voltHeaderLogo.size().height()),
			)
			.addFlow(multilineText(texts.text, regularFont.atSize(14), black, headerTitleWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(ballot241.electionName, regularFont.atSize(10), black, headerTitleWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(texts.explainer, regularFont.atSize(8), black, maxWidth))
			.addFlow(whitespace(vector2d(0, 5)))
			.addFlow(multilineText(texts.instruction, regularFont.atSize(9), black, maxWidth))
			.addFlow(whitespace(vector2d(0, 10)));

		writer.addObject(headerGroup);

		const candidates = sortCandidates(ballot241.candidates);

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

				innerGroup
					.addFlow(centeredText(`Ab Listenplatz: ${candidate.minSpot}`, boldFont.atSize(8), black, vector2d(candidateWidth, 5)))
					.addFlow(whitespace(vector2d(0, 2)));

				for (let j = 0; j <= boxes; j++) {
					const text = j === 0 ? "0 | Nein" : `${j}`;

					innerGroup.addRelative(
						centeredText(text, regularFont.atSize(8), black, vector2d(boxWidth, 5)),
						vector2d(boxOffsets[j], 0),
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

	async ballot242(ballot242: Ballot242): Promise<ArrayBuffer> {
		throw new Error("Method not implemented.");
	}

	async resultComplete(result: ResultComplete): Promise<ArrayBuffer> {
		const manager = pdfDocumentManager();
		const document = await manager.create();

		const { UbuntuR, UbuntuB, UbuntuRI } = await this.getAssets();

		const regularFont = await document.addFont(UbuntuR);
		const boldFont = await document.addFont(UbuntuB);
		const italicFont = await document.addFont(UbuntuRI);
		const black = color(0, 0, 0);

		const geometry = PdfGeometries.A4;

		const writer = pdfVirtualWriter(geometry.padding(15, 20, 15, 20));

		const maxWidth = writer.safeGeometryWidth();

		writer
			.addObject(
				multilineText(
					`Ergebniszettel für ${result.electionName} bei der ${result.assemblyName}`,
					boldFont.atSize(14),
					black,
					maxWidth,
				),
			)
			.addObject(whitespace(vector2d(0, 7)));

		writer
			.addObject(
				multilineText(
					`Ergebnis des 1. Wahlgangs nach § 23 Abs. 1 der Allgemeinen Wahlordnung von Volt Deutschland`,
					regularFont.atSize(12),
					black,
					maxWidth,
				),
			)
			.addObject(whitespace(vector2d(0, 7)));

		const textMapper = mapMultilineText(regularFont.atSize(9), black, maxWidth);
		const boldMapper = mapMultilineText(boldFont.atSize(9), black, maxWidth);

		for (const message of result.result.messages) {
			switch (message.type) {
				case "vote-count":
					writer
						.addObject(textMapper(`Es wurden insgesamt ${message.count} Stimmen abgegeben.`))
						.addObject(whitespace(vector2d(0, 1)))
						.addObject(textMapper(`${message.male} Stimmzettel für die ${electionGenderString("male")} Liste`))
						.addObject(textMapper(`${message.female} Stimmzettel für die ${electionGenderString("female")} Liste`))
						.addObject(whitespace(vector2d(0, 5)));
					break;
				case "troublemakers":
					writer
						.addObject(multilineText(`Zulassung zur Gesamtliste nach § 24 Abs. 1 der Allgemeinen Wahlordnung ` +
								`von Volt Deutschland`, boldFont.atSize(12), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObject(multilineText(this.explainTexts.troublemakers, italicFont.atSize(8), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)))
						.addObjects(this.troublemakers(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 5)));
					break;
				case "preliminary-list":
					writer
						.addObject(
							multilineText(
								`Bestimmung der ${electionGenderString(message.list)}n Vorabliste nach § 24 Abs. 2 der Allgemeinen Wahlordnung von Volt Deutschland`,
								boldFont.atSize(12),
								black,
								maxWidth,
							),
						)
						.addObject(whitespace(vector2d(0, 3)))
						.addObject(multilineText(this.explainTexts.preliminaryList1, italicFont.atSize(8), black, maxWidth))
						.addObject(whitespace(vector2d(0, 2)))
						.addObject(multilineText(this.explainTexts.preliminaryList2, italicFont.atSize(8), black, maxWidth))
						.addObject(whitespace(vector2d(0, 3)));

					const ga = objectGroup()
						.addFlow(boldMapper(`Übersicht der erlangten durchschnittlichen Punktzahlen der Bewerber*innen`))
						.addFlow(whitespace(vector2d(0, 3)));

					const pl = result.result.preliminaryLists[message.list];

					const sorted = [...pl].sort((a, b) => b.score - a.score);

					for (const onList of sorted) {
						const candidate = result.candidates.find((c) => c.id === onList.candidateId)!;
						ga.addFlow(
							objectGroup()
								.addFlow(textMapper(renderCandidateName(candidate)))
								.addRelative(textMapper(`Durchschnitt: ${this.round4Digits(onList.score)}`), vector2d(maxWidth * 0.45, 0))
						);
					}

					ga.addFlow(whitespace(vector2d(0, 5)));

					writer
						.addObject(ga)
						.addObjects(this.preliminaryList(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 3)));

					const gg = objectGroup();
					gg.addFlow(boldMapper(`Die ${electionGenderString(message.list)} Vorabliste wurde wie folgt bestimmt:`))
						.addFlow(whitespace(vector2d(0, 3)));

					for (const entry of pl) {
						const name = BallotGeneratorImpl.candidateNameById(result, entry.candidateId);

						gg.addFlow(
							objectGroup()
								.addFlow(boldMapper(`Listenplatz ${entry.position}`))
								.addRelative(textMapper(name), vector2d(maxWidth * 0.15, 0))
								.addRelative(
									textMapper(`Durchschnitt: ${this.round4Digits(entry.score)}`),
									vector2d(maxWidth * 0.45, 0),
								)
								.addRelative(textMapper(`Direkte Vergleiche verloren: ${-entry.shift}`), vector2d(maxWidth * 0.65, 0)),
						);
					}

					gg.addFlow(whitespace(vector2d(0, 5)));

					writer.addObject(gg);

					break;
				case "runoff-candidates":
					writer
						.addObject(
							multilineText(
								`Bestimmung Bewerber*innen für die Stichwahl nach § 23 Abs. 4 der Allgemeinen Wahlordnung von Volt Deutschland`,
								boldFont.atSize(12),
								black,
								maxWidth,
							),
						)
						.addObjects(this.runoffCandidates(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 5)));
					break;
				case "runoff":
					writer
						.addObject(
							multilineText(
								`Ergebnis der Stichwahl nach § 23 Abs. 4 der Allgemeinen Wahlordnung von Volt Deutschland`,
								boldFont.atSize(12),
								black,
								maxWidth,
							),
						)
						.addObjects(this.runoff(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 5)));
					break;
				case "combined":
					writer
						.addObject(
							multilineText(
								`Bestimmung der Gesamtliste nach § 24 Abs. 6 der Allgemeinen Wahlordnung von Volt Deutschland`,
								boldFont.atSize(12),
								black,
								maxWidth,
							),
						)
						.addObjects(this.combined(result, textMapper, boldMapper, message))
						.addObject(whitespace(vector2d(0, 5)));
					break;
			}
		}

		writer.complete(document);

		return await manager.exportAsArrayBuffer(document);
	}

	private readonly explainTexts = {
		troublemakers:
			`Die Zulassung von Bewerber*innen für die Gesamtliste wird in § 24 Abs. 1 der Allgemeinen ` +
			`Wahlordnung von Volt Deutschland geregelt. Demnach ist ein*e Bewerber*in nicht zugelassen, wenn er oder ` +
			`sie "im ersten Wahlgang auf mindestens der Hälfte der abgegebenen Wahllisten, auf denen für den*die ` +
			`jeweilige*n Bewerber*in eine Punktzahl vergeben wurde, die Punktzahl null erhalten" hat. Dies bedeutet ` +
			`im Umkehrschluss, dass Bewerber*innen zugelassen sind, wenn sie auf weniger als der Hälfte der relevanten ` +
			`Wahllisten null Punkte erhalten haben.`,
		preliminaryList1:
			`Die Bestimmung der Listenplätze auf den vorläufigen Listen erfolgt gemäß § 24 Absatz 2 der ` +
			`Allgemeinen Wahlordnung von Volt Deutschland in einem mehrstufigen Prozess. Zunächst wird für jeden ` +
			`Listenplatz der Mittelwert der abgegebenen Punktzahlen aller noch nicht platzierten Bewerber*innen ermittelt. ` +
			`Dabei werden nicht abgegebene Punktzahlen nicht berücksichtigt. Anschließend werden die beiden Kandidat*innen ` +
			`mit den höchsten Mittelwerten direkt verglichen, wobei derjenige den Listenplatz erhält, der häufiger eine ` +
			`höhere Punktzahl bekommen hat.`,
		preliminaryList2:
			`Bei Gleichständen zwischen drei oder mehr Bewerber*innen werden diejenigen zwei verglichen, ` +
			`die am häufigsten die höchste Punktzahl erhalten haben. Sollte es auch hier zu einem Gleichstand kommen, ` +
			`entscheidet die Anzahl der nächsthöchsten Punktzahl. Wenn alle Bewertungen gleich sind, wird per Losverfahren ` +
			`entschieden. Der Paragraph sieht auch vor, dass der*die letzte verbliebene Bewerber*in automatisch den letzten ` +
			`Listenplatz erhält. Dieser Prozess wird für jeden Listenplatz wiederholt, bis die vorläufige Liste vollständig ` +
			`ist.`,
	};

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
		message: EvaluationMessagePreliminaryList,
	): Pdf2DObject[] {
		const out: Pdf2DObject[] = [];

		for (const m of message.messages) {
			const group = objectGroup();

			if (m.type === "preliminary-list-spot-duo") {
				const winnerName = BallotGeneratorImpl.candidateNameById(result, m.winner.candidateId);
				const loserName = BallotGeneratorImpl.candidateNameById(result, m.loser.candidateId);

				group
					.addFlow(
						boldMapper(`Bestimmung des Listenplatzes ${m.position} auf der ${electionGenderString(message.list)}n Vorabliste`),
					)
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(textMapper(`Die Bewerber*innen ${winnerName} und ${loserName} haben jeweils die beiden höchsten Mittelwerte.`))
					.addFlow(textMapper(`${winnerName} erhielt eine Punktzahl von ${this.round4Digits(m.winner.score)} und `))
					.addFlow(textMapper(`${loserName} eine Punktzahl von ${this.round4Digits(m.loser.score)}.`))
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(
						textMapper(
							`Im Direkten vergleich wurden ${m.directComparisonExcludedBallots} Stimmzettel ausgeschlossen, ` +
								`da auf jeweils einem (oder beiden) der Stimmzettel keine Punktzahl angegeben wurde.`,
						),
					)
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(
						textMapper(`Auf ${m.winner.directComparisonBallots} Stimmzetteln erhielt ${winnerName} die höhere Punktzahl, `),
					)
					.addFlow(textMapper(`auf ${m.loser.directComparisonBallots} Stimmzetteln erhielt ${loserName} die höhere Punktzahl.`))
					.addFlow(whitespace(vector2d(0, 1)));

				if (m.directComparisonTieBreaker && m.directComparisonTieBreaker.length > 0) {
					group
						.addFlow(
							textMapper(
								`Durch den Gleichstand wird nun die Anzahl der Punktzahlen verglichen, welche nicht bei ` +
									`beiden Bewerber*innen gleich ist.`,
							),
						)
						.addFlow(whitespace(vector2d(0, 1)));

					for (const msg of m.directComparisonTieBreaker) {
						const ccs = Object.entries(msg.counts).map(
							(v) =>
								`Bewerber*in ${BallotGeneratorImpl.candidateNameById(result, v[0])} erhielt auf ${v[1]} Stimmzetteln die Punktzahl ${msg.points}`,
						);
						for (const mm of ccs) {
							group.addFlow(textMapper(mm));
						}
						group.addFlow(whitespace(vector2d(0, 1)));
					}
				}

				group
					.addFlow(
						boldMapper(
							`${winnerName} erhält somit den Listenplatz ${m.position} auf der ${electionGenderString(message.list)}n Vorabliste.`,
						),
					)
					.addFlow(whitespace(vector2d(0, 3)));
			} else if (m.type === "preliminary-list-spot-single") {
				group
					.addFlow(
						boldMapper(`Bestimmung des Listenplatzes ${m.position} auf der ${electionGenderString(message.list)}n Vorabliste`),
					)
					.addFlow(whitespace(vector2d(0, 1)))
					.addFlow(
						textMapper(
							`Als letzte*r verbleibende*r Beweber*in erhält ${BallotGeneratorImpl.candidateNameById(result, m.candidateId)} den Listenplatz.`,
						),
					)
					.addFlow(
						boldMapper(
							`${BallotGeneratorImpl.candidateNameById(result, m.candidateId)} erhält somit den Listenplatz ${m.position} auf der ${electionGenderString(message.list)}n Vorabliste.`,
						),
					)
					.addFlow(whitespace(vector2d(0, 3)));
			} else if (m.type === "preliminary-list-overview") {
				group
					.addFlow(boldMapper(`Übersicht der erlangten durchschnittlichen Punktzahlen der Bewerber*innen`))
					.addFlow(whitespace(vector2d(0, 1)));

				const averages = Object.entries(m.averages).sort((a, b) => b[1].average - a[1].average);

				for (const avg of averages) {
					const name = BallotGeneratorImpl.candidateNameById(result, avg[0]);
					group.addFlow(
						textMapper(
							`${name} erhielt durchschnittlich ${this.round4Digits(avg[1].average)} Punkte auf ${avg[1].count} Stimmzetteln.`,
						),
					);
				}

				group.addFlow(whitespace(vector2d(0, 3)));
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
	): Pdf2DObject[] {
		return [];
	}

	runoff(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessageRunoff,
	): Pdf2DObject[] {
		return [];
	}

	combined(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessageCombined,
	): Pdf2DObject[] {
		return [];
	}

	troublemakers(
		result: ResultComplete,
		textMapper: (text: string) => PdfObjectGroup,
		boldMapper: (text: string) => PdfObjectGroup,
		message: EvaluationMessageTroublemakers,
	): Pdf2DObject[] {
		const out: Pdf2DObject[] = [];

		const cds = sortCandidates(message.candidates.map((c) => result.candidates.find((cc) => cc.id === c.candidateId)!));

		for (const cdid of cds) {
			const tc = message.candidates.find((c) => c.candidateId === cdid.id)!;

			const group = objectGroup();

			const candidate = result.candidates.find((c) => c.id === tc.candidateId)!;
			const name = renderCandidateName(candidate);
			const listString = electionGenderString(candidate.list);
			group.addFlow([
				textMapper(`Berweber*in auf dem ${listString}n Stimmzettel ${name} erhielt`),
				textMapper(`auf ${tc.nullVotes} Stimmzetteln die Punktzahl 0 und `),
				textMapper(`auf ${tc.nonNullVotes} Stimmzetteln erhielt er*sie eine Punktzahl.`),
				whitespace(vector2d(0, 1)),
			]);

			if (tc.passed) group.addFlow(boldMapper(`${name} ist demnach für die Liste zugelassen.`));
			else group.addFlow(boldMapper(`${name} ist demnach nicht für die Liste zugelassen.`));
			group.addFlow(whitespace(vector2d(0, 3)));

			out.push(group);
		}

		return out;
	}
}
