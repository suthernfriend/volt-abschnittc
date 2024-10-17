import { type PdfPage, PdfPageImpl } from "@/pdflib2/PdfPage";
import { type PdfFont, PdfFontImpl } from "@/pdflib2/PdfFont";

export interface PdfDocument {
	pages(): PdfPage[];

	addPage(): PdfPage;
}

export class PdfDocumentImpl implements PdfDocument {
	private readonly _pages: PdfPage[] = [];

	pages(): PdfPage[] {
		return this._pages;
	}

	addPage(): PdfPage {
		const page = new PdfPageImpl();
		this._pages.push(page);
		return page;
	}
}
