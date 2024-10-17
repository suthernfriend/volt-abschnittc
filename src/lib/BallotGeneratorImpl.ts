import type { Ballot241, Ballot242, BallotGenerator, PageSizeNames, ResultComplete } from "@/lib/BallotGenerator";
import { pdfDocumentManager } from "@/pdflib2/PdfDocumentManager";
import { pdfVirtualWriter } from "@/pdflib2/PdfBufferedVirtualWriter";
import { PdfGeometries, type PdfPageGeometry } from "@/pdflib2/PdfGeometries";
import { color } from "@/pdflib2/PdfColor";
import { renderCandidateName, sortCandidates } from "@/lib/Types";
import { objectGroup } from "@/pdflib2/PdfObjectGroup";
import { centeredText, multilineText, rightAlignedText } from "@/pdflib2/PdfText";
import { root, vector2d } from "@/pdflib2/Vector2d";
import { whitespace } from "@/pdflib2/PdfWhitespace";
import { strokeRect } from "@/pdflib2/PdfRectangle";

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
		const UbuntuR = await import("@/fonts/Ubuntu-R.ttf?arraybuffer") as any;
		const UbuntuB = await import("@/fonts/Ubuntu-B.ttf?arraybuffer") as any;
		const VoltLogo = await import("@/assets/logo-dark.png?arraybuffer") as any;

		return { UbuntuR, UbuntuB, VoltLogo };
	}

	async ballot241(ballot241: Ballot241): Promise<ArrayBuffer> {
		const manager = pdfDocumentManager();
		const document = await manager.create();

		const { UbuntuR, UbuntuB, VoltLogo } = await this.getAssets();

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

			// if (candidate.list !== "male") continue;

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

		const { UbuntuR, UbuntuB, VoltLogo } = await this.getAssets();

		const regularFont = await document.addFont(UbuntuR);
		const boldFont = await document.addFont(UbuntuB);
		const voltLogo = await document.addImage(VoltLogo, "png");
		const black = color(0, 0, 0);

		const geometry = PdfGeometries.A4;

		const writer = pdfVirtualWriter(geometry.padding(20, 20, 20, 25));

		const maxWidth = writer.safeGeometryWidth();

		writer.addObject(
			multilineText(`Ergebniszettel für ${result.electionName} bei der ${result.assemblyName}`, boldFont.atSize(14), black, maxWidth),
		);

		writer.complete(document);

		return await manager.exportAsArrayBuffer(document);
	}
}
