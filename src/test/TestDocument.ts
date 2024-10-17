import { PdfDocumentManagerImpl } from "@/pdflib2/PdfDocumentManager";

import { PdfPageWriter } from "@/pdflib2/PdfPageWriter";
import { centeredText, text } from "@/pdflib2/PdfText";
import { readFile, writeFile } from "fs/promises";
import { type Candidate, renderCandidateName, sortCandidates } from "@/lib/Types";
import type { PdfFont } from "@/pdflib2/PdfFont";
import { pdfVirtualWriter } from "@/pdflib2/PdfBufferedVirtualWriter";
import { PdfGeometries } from "@/pdflib2/PdfGeometries";
import { color, type PdfColor } from "@/pdflib2/PdfColor";
import { strokeRect } from "@/pdflib2/PdfRectangle";
import { root, vector2d } from "@/pdflib2/Vector2d";
import { objectGroup } from "@/pdflib2/PdfObjectGroup";
import { testCandidates } from "@/test/TestData";
import { whitespace } from "@/pdflib2/PdfWhitespace";

function candidate(candidate: Candidate, writer: PdfPageWriter, font: PdfFont, color: PdfColor) {
	const name = renderCandidateName(candidate);

	writer.addObject(text(name, font, color));
}

async function main() {
	const documentManager = new PdfDocumentManagerImpl({});

	const doc = await documentManager.create();

	const ubuntuRFontFile = await readFile("./src/fonts/Ubuntu-R.ttf");
	const ubuntuBFontFile = await readFile("./src/fonts/Ubuntu-B.ttf");
	const regularFont = await doc.addFont(ubuntuRFontFile.buffer);
	const boldFont = await doc.addFont(ubuntuBFontFile.buffer);
	const theColor = color(0, 0, 0);

	const virtualWriter = pdfVirtualWriter(PdfGeometries.A4.padding(10, 10, 10, 10));
	const candidates = sortCandidates(testCandidates);

	let lastMinSpot = 0;

	const candidateWidth = virtualWriter.safeGeometryWidth() * (1/3);
	const pointsWidth = candidateWidth * 2;
	const boxWidth = 5;

	for (let i = 0; i < candidates.length; i++) {
		const candidate = candidates[i];

		// if (candidate.list !== "male") continue;

		const boxes = 10;
		const boxSpacing = (pointsWidth - ((boxes + 1) * boxWidth)) / 10;
		const boxOffsets: number[] = [];
		for (let j = 0; j <= boxes; j++) {
			boxOffsets.push(candidateWidth + j * (boxWidth + boxSpacing));
		}

		const group = objectGroup();

		if (candidate.minSpot !== lastMinSpot) {
			const innerGroup = objectGroup();

			innerGroup
				.addFlow(centeredText(`Ab Listenplatz: ${candidate.minSpot}`, boldFont.atSize(8), theColor, vector2d(candidateWidth, 5)))
				.addFlow(whitespace(vector2d(0, 2)));

			for (let j = 0; j <= boxes; j++) {
				const text = j === 0 ? "0 | Nein" : `${j}`;

				innerGroup.addRelative(centeredText(text, boldFont.atSize(8), theColor, vector2d(boxWidth, 5)), vector2d(boxOffsets[j], 0));
			}

			group.addFlow(innerGroup);

			lastMinSpot = candidate.minSpot;
		}

		const outerGroup = objectGroup();

		outerGroup
			.addFlow(text(renderCandidateName(candidate), regularFont.atSize(10), theColor))
			.addRelative(whitespace(vector2d(0, 11)), root());

		for (let j = 0; j <= boxes; j++) {
			outerGroup.addRelative(strokeRect(vector2d(boxWidth, 5), 1, theColor), vector2d(boxOffsets[j], 0));
		}

		group.addFlow(outerGroup);

		virtualWriter.addObject(group);
	}

	virtualWriter.complete(doc);

	const arrayBuffer = await documentManager.exportAsArrayBuffer(doc);
	await writeFile("./dist/output.pdf", Buffer.from(arrayBuffer));
}

main()
	.then(() => console.log("done"))
	.catch(console.error);
