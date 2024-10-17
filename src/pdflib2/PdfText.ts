import { isPdf2DObject, type Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import type { PdfObject } from "@/pdflib2/PdfObject";
import type { PdfColor } from "@/pdflib2/PdfColor";
import { v4 } from "uuid";
import type { Vector2d } from "@/pdflib2/Vector2d";
import type { PdfFont } from "@/pdflib2/PdfFont";

export interface PdfText extends Pdf2DObject {
	text(): string;

	font(): PdfFont;

	color(): PdfColor;
}

export function isPdfText(object: any): object is PdfText {
	if (object == null || !isPdf2DObject(object)) {
		return false;
	}
	if ("text" in object && typeof object.text === "function") {
		if ("font" in object && typeof object.font === "function") {
			if ("color" in object && typeof object.color === "function") {
				return true;
			}
		}
	}
	return false;
}

export class PdfTextImpl implements PdfText {
	private readonly _id: string;
	private readonly textValue: string;
	private readonly fontValue: PdfFont;
	private readonly colorValue: PdfColor;

	constructor(text: string, font: PdfFont, color: PdfColor) {
		this._id = v4();
		this.textValue = text;
		this.fontValue = font;
		this.colorValue = color;
	}

	id(): string {
		return this._id;
	}

	size(): Vector2d {
		return this.fontValue.sizeOfText(this.textValue);
	}

	text(): string {
		return this.textValue;
	}

	font(): PdfFont {
		return this.fontValue;
	}

	color(): PdfColor {
		return this.colorValue;
	}
}

export function text(text: string, font: PdfFont, color: PdfColor): PdfText {
	return new PdfTextImpl(text, font, color);
}
