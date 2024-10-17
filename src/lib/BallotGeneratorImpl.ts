import type { ListCompleteResult, NeedRunoffResult } from "@/lib/Evaluation";
import type { Ballot241, Ballot242, BallotGenerator, PageSizeNames } from "@/lib/BallotGenerator";
import { PageSizes, PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";

const PageSizeDrawConfig: {
	[key in PageSizeNames]: {
		rows: number;
		copies: number;
		size: [number, number];
	};
} = {
	A42: { rows: 2, copies: 1, size: [PageSizes.A4[1], PageSizes.A4[0]] }, // "1 Stimmzettel auf A4 in 2 Spalten",
	A41: { rows: 1, copies: 1, size: PageSizes.A4 }, // "1 Stimmzettel auf A4",
	"2A4": { rows: 1, copies: 2, size: [PageSizes.A4[1], PageSizes.A4[0]] }, // "2 Stimmzettel auf A4",
	A32: { rows: 2, copies: 1, size: [PageSizes.A3[1], PageSizes.A3[0]] }, // "1 Stimmzettel auf A3 in 2 Spalten",
	A31: { rows: 1, copies: 1, size: PageSizes.A3 }, // "1 Stimmzettel auf A3"
};

function mm2dpt(mm: number) {
	return mm / 0.352777778;
}

function dpt2mm(dpt: number) {
	return dpt * 0.352777778;
}

export class BallotGeneratorImpl implements BallotGenerator {
	constructor() {}

	async document(): Promise<PDFDocument> {
		const doc = await PDFDocument.create();
		doc.registerFontkit(fontkit);

		return doc;
	}

	async ballot241(ballot241: Ballot241): Promise<string> {
		const document = await this.document();
		const config = PageSizeDrawConfig[ballot241.pageSize];
		const page = document.addPage(config.size);

		const pagePadding = 10;

		let y = pagePadding;
		const printableHeight = dpt2mm(page.getHeight()) - pagePadding * 2;
		const rows = config.rows;
		const copies = config.copies;

		const printableWidth = dpt2mm(page.getWidth()) - pagePadding * 2;
		const copyWidth = dpt2mm(page.getWidth()) / copies - copies * pagePadding;

		for (let i = 0; i < copies; i++) {
			const x = pagePadding + i * (copyWidth + pagePadding * 2);
			const copyHeight = printableHeight / rows;

			// header with Volt Logo, Unique ID, Election Name, Assembly Name
			page.drawRectangle({
				x: mm2dpt(x),
				y: mm2dpt(y),
				width: mm2dpt(copyWidth),
				height: mm2dpt(copyHeight),
			});
		}

		return await document.saveAsBase64({ dataUri: true });
	}

	ballot242(ballot242: Ballot242): Promise<string> {
		return Promise.resolve(undefined);
	}

	result241(needRunoffResult: NeedRunoffResult | ListCompleteResult): Promise<string> {
		return Promise.resolve(undefined);
	}

	result242(needRunoffResult: NeedRunoffResult): Promise<string> {
		return Promise.resolve(undefined);
	}
}
