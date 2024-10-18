import { type PdfDocument, PdfDocumentImpl } from "@/pdflib2/PdfDocument";
import { color, type PdfColor } from "@/pdflib2/PdfColor";
import { type PdfFont, PdfFontImpl } from "@/pdflib2/PdfFont";
import { ColorTypes, PDFDocument, PDFFont, PDFImage, PDFPage, type RGB } from "pdf-lib";
import { isPdfText, type PdfText } from "@/pdflib2/PdfText";
import { v4 } from "uuid";
import { type Vector2d, vector2d } from "@/pdflib2/Vector2d";
import { isPdfObjectGroup } from "@/pdflib2/PdfObjectGroup";
import type { PdfObject } from "@/pdflib2/PdfObject";
import { type PdfPositionedObject, positionedObject } from "@/pdflib2/PdfPositionedObject";
import { isPdfRectangle, type PdfRectangle, strokeRect } from "@/pdflib2/PdfRectangle";
import { isPdfImage, type PdfImage, PdfImageImpl } from "@/pdflib2/PdfImage";

export interface PdfDocumentManager {
	create(): Promise<PdfDocument>;

	exportAsArrayBuffer(document: PdfDocument): Promise<ArrayBuffer>;
}

function mm2dtp(mm: number): number {
	return mm * (1 / 0.352778);
}

function dtp2mm(dpt: number): number {
	return dpt * 0.352778;
}

export interface PdfDocumentManagerImplOptions {
	debug?: boolean;
}

class PdfDocumentManagerImpl implements PdfDocumentManager {
	private docs: {
		[ref: string]: {
			document: PDFDocument;
			fonts: { [ref: string]: PDFFont };
			images: { [ref: string]: PDFImage };
		};
	} = {};

	constructor(private readonly options: PdfDocumentManagerImplOptions) {}

	async create(): Promise<PdfDocument> {
		const ref = v4();

		this.docs[ref] = {
			document: await PDFDocument.create(),
			fonts: {},
			images: {},
		};

		const fontkit = await import("@pdf-lib/fontkit");
		this.docs[ref].document.registerFontkit(fontkit.default);

		const splitIntoLines = (font: PDFFont, text: string, dtp: number, width: number) => {
			const words = text.split(/\s+/);
			const lines: string[] = [];
			const next: string[] = [];

			while (words.length > 0) {
				const withNextWord = next.concat(words[0]).join(" ");
				const widthWithNextWord = dtp2mm(font.widthOfTextAtSize(withNextWord, dtp));
				if (widthWithNextWord > width) {
					lines.push(next.join(" "));
					next.length = 0;
				} else {
					next.push(words.shift() as string);
				}
			}

			if (next.length > 0) {
				lines.push(next.join(" "));
			}

			return lines;
		};

		const sizeOfTextGetter = (font: PDFFont, text: string, dtp: number) => {
			const widthDtp = font.widthOfTextAtSize(text, dtp);
			const heightDtp = font.heightAtSize(dtp);

			const width = dtp2mm(widthDtp);
			const height = dtp2mm(heightDtp);

			return vector2d(width, height);
		};

		const font = async (bytes: ArrayBuffer) => {
			const fontRef = v4();
			const font = await this.docs[ref].document.embedFont(bytes);

			this.docs[ref].fonts[fontRef] = font;

			const pdfFont = new PdfFontImpl({
				ref: fontRef,
				size: 12,
				name: font.name,
				splitIntoLines: (text: string, dtp: number, width: number) => {
					return splitIntoLines(font, text, dtp, width);
				},
				sizeOfTextGetter: (text: string, dtp: number) => {
					return sizeOfTextGetter(font, text, dtp);
				},
			});

			return pdfFont as PdfFont;
		};

		const image = async (bytes: ArrayBuffer, type: "png") => {
			const imgRef = v4();
			const rImg = await this.docs[ref].document.embedPng(bytes);

			this.docs[ref].images[imgRef] = rImg;

			const width = dtp2mm(rImg.width);
			const height = dtp2mm(rImg.height);

			return new PdfImageImpl({
				size: vector2d(width, height),
				ref: imgRef,
			});
		};

		return new PdfDocumentImpl({
			ref,
			font,
			image,
		});
	}

	static colorToRGB(color: PdfColor): RGB {
		return {
			type: ColorTypes.RGB,
			red: color.red(),
			green: color.green(),
			blue: color.blue(),
		};
	}

	renderRectangle(tl: Vector2d, obj: PdfRectangle, docId: string, rPage: PDFPage) {
		const translated = this.translateVector2d(rPage, tl, obj.size());

		rPage.drawRectangle({
			x: translated.x(),
			y: translated.y(),
			width: mm2dtp(obj.size().width()),
			height: mm2dtp(obj.size().height()),
			color: obj.isFilled() ? PdfDocumentManagerImpl.colorToRGB(obj.fillColor()) : undefined,
			borderColor: obj.isFilled() ? undefined : PdfDocumentManagerImpl.colorToRGB(obj.color()),
			borderWidth: obj.isFilled() ? undefined : obj.lineWidth(),
		});
	}

	translateVector2d(rPage: PDFPage, topLeft: Vector2d, size: Vector2d): Vector2d {
		const translatedX = mm2dtp(topLeft.x());
		const translatedY = rPage.getHeight() - mm2dtp(topLeft.y()) - mm2dtp(size.height());

		return vector2d(translatedX, translatedY);
	}

	renderImage(tl: Vector2d, obj: PdfImage, docId: string, rPage: PDFPage) {
		const img = this.docs[docId].images[obj.ref()];

		const translated = this.translateVector2d(rPage, tl, obj.size());

		rPage.drawImage(img, {
			x: translated.x(),
			y: translated.y(),
			width: mm2dtp(obj.size().width()),
			height: mm2dtp(obj.size().height()),
		});
	}

	renderText(tl: Vector2d, obj: PdfText, docId: string, rPage: PDFPage) {
		const text = obj.text();
		const font = obj.font();
		const pdfColor = obj.color();
		const position = obj.position().add(tl);

		const size = font.sizeOfText(text);

		// console.log(`translatedX: ${translatedX}, translatedY: ${translatedY}, tly: ${tl.y()}, size.height: ${size.height()}`);
		const rTranslated = this.translateVector2d(rPage, position, size);

		if (this.options.debug) this.renderRectangle(position, strokeRect(size, 0.3, color(0.1, 0.1, 0.7)), docId, rPage);

		rPage.drawText(text, {
			x: rTranslated.x(),
			y: rTranslated.y(),
			font: this.docs[docId].fonts[font.ref()],
			size: obj.font().fontSize(),
			color: PdfDocumentManagerImpl.colorToRGB(pdfColor),
		});
	}

	reducePageObject(objects: PdfPositionedObject<PdfObject>[]): PdfPositionedObject<PdfObject>[] {
		const out: PdfPositionedObject<PdfObject>[] = [];

		for (const posObj of objects) {
			const obj = posObj.object();

			if (isPdfObjectGroup(obj)) {
				const children = obj.children();
				const reducedChildren = this.reducePageObject(children);

				const translated: PdfPositionedObject<PdfObject>[] = reducedChildren.map((child) => {
					return positionedObject(child.position().add(posObj.position()), child.object());
				});

				out.push(...translated);
			} else {
				out.push(posObj);
			}
		}

		return out;
	}

	async exportToStream(document: PdfDocument): Promise<PDFDocument> {
		const ref = document.ref();

		if (!this.docs.hasOwnProperty(ref)) {
			throw new Error(`Document ${ref} not found`);
		}
		const rDoc = this.docs[document.ref()];

		for (const page of document.pages()) {
			let pageSize = page.size();
			const rPage = rDoc.document.addPage([mm2dtp(pageSize.width()), mm2dtp(pageSize.height())]);

			const reduced = this.reducePageObject(page.objects());

			for (const posObj of reduced) {
				const tl = posObj.position();
				const obj = posObj.object();

				if (isPdfText(obj)) {
					this.renderText(tl, obj, ref, rPage);
				} else if (isPdfRectangle(obj)) {
					this.renderRectangle(tl, obj, ref, rPage);
				} else if (isPdfImage(obj)) {
					this.renderImage(tl, obj, ref, rPage);
				}
			}
		}

		return rDoc.document;
	}

	async exportAsArrayBuffer(document: PdfDocument): Promise<ArrayBuffer> {
		const doc = await this.exportToStream(document);
		const buffer = await doc.save();
		return buffer.buffer;
	}
}

export function pdfDocumentManager(): PdfDocumentManager {
	return new PdfDocumentManagerImpl({
		debug: false,
	});
}
