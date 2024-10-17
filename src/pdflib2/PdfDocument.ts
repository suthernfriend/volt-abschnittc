import { type PdfPage, PdfPageImpl } from "@/pdflib2/PdfPage";
import { type PdfFont } from "@/pdflib2/PdfFont";
import type { Vector2d } from "@/pdflib2/Vector2d";
import type { PdfImage } from "@/pdflib2/PdfImage";

export interface PdfDocument {
	pages(): PdfPage[];

	getOrAddPage(index: number, size: Vector2d): PdfPage;

	addPage(size: Vector2d): PdfPage;

	ref(): string;

	addFont(bytes: ArrayBuffer): Promise<PdfFont>;

	addImage(bytes: ArrayBuffer, type: "png"): Promise<PdfImage>;
}

export interface PdfDocumentImplOptions {
	ref: string;
	font: (bytes: ArrayBuffer) => Promise<PdfFont>;
	image: (bytes: ArrayBuffer, type: "png") => Promise<PdfImage>;
}

export class PdfDocumentImpl implements PdfDocument {
	private readonly _pages: PdfPage[] = [];

	constructor(private readonly options: PdfDocumentImplOptions) {}

	ref(): string {
		return this.options.ref;
	}

	pages(): PdfPage[] {
		return this._pages;
	}

	getOrAddPage(index: number, size: Vector2d): PdfPage {
		while (this._pages.length <= index) {
			this.addPage(size);
		}

		return this._pages[index];
	}

	addPage(size: Vector2d): PdfPage {
		const page = new PdfPageImpl({
			size,
		});
		this._pages.push(page);
		return page;
	}

	addFont(bytes: ArrayBuffer): Promise<PdfFont> {
		return this.options.font(bytes);
	}

	addImage(bytes: ArrayBuffer, type: "png"): Promise<PdfImage> {
		return this.options.image(bytes, type);
	}
}
