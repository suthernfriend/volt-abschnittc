import { type PdfDocument, PdfDocumentImpl } from "@/pdflib2/PdfDocument";
import { type PdfColor, PdfColorImpl } from "@/pdflib2/PdfColor";
import { type PdfFont, PdfFontImpl } from "@/pdflib2/PdfFont";
import PDFDocument from "pdfkit";
import BlobStream from "blob-stream";
import { isPdfText } from "@/pdflib2/PdfText";

export interface PdfDocumentManager {
	create(): PdfDocument;

	color(red: number, green: number, blue: number): PdfColor;

	font(name: string): PdfFont;

	exportAsBlobUrl(document: PdfDocument): Promise<string>;

	exportAsArrayBuffer(document: PdfDocument): Promise<ArrayBuffer>;
}

export class PdfDocumentManagerImpl implements PdfDocumentManager {
	constructor() {}

	create(): PdfDocument {
		return new PdfDocumentImpl();
	}

	exportToStream(document: PdfDocument): BlobStream.IBlobStream {
		const rDoc = new PDFDocument({
			bufferPages: true,
			autoFirstPage: false
		});

		for (const page of document.pages()) {
			rDoc.addPage({
				size: "A4"
			});

			for (const positionedObject of page.objects()) {
				const obj = positionedObject.object();
				if (isPdfText(obj)) {
					const text = obj.text();
					rDoc.text(text);
				} else {
					console.error("unknown object", obj);
				}
			}
		}

		const stream = rDoc.pipe(BlobStream());
		rDoc.end();

		return stream;
	}

	exportAsBlobUrl(document: PdfDocument): Promise<string> {
		return new Promise((resolve, reject) => {
			const stream = this.exportToStream(document);
			stream.on("finish", function () {
				const url = stream.toBlobURL("application/pdf");
				resolve(url);
			});
		});
	}

	exportAsArrayBuffer(document: PdfDocument): Promise<ArrayBuffer> {
		return new Promise((resolve, reject) => {
			const stream = this.exportToStream(document);

			stream.on("finish", function () {
				const blob = stream.toBlob("application/pdf");
				blob.arrayBuffer()
					.then((buffer) => {
						resolve(buffer);
					})
					.catch((error) => {
						reject(error);
					});
			});
		});
	}

	color(red: number, green: number, blue: number): PdfColor {
		return new PdfColorImpl(red, green, blue);
	}

	font(name: string): PdfFont {
		return new PdfFontImpl(name);
	}
}
