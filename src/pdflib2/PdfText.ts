import { isPdf2DObject, type Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import type { PdfColor } from "@/pdflib2/PdfColor";
import { v4 } from "uuid";
import { root, type Vector2d } from "@/pdflib2/Vector2d";
import type { PdfFont } from "@/pdflib2/PdfFont";

export interface PdfText extends Pdf2DObject {
	text(): string;

	font(): PdfFont;

	color(): PdfColor;

	position(): Vector2d;
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

export interface PdfTextImplOptions {
	text: string;
	font: PdfFont;
	color: PdfColor;
	size?: Vector2d;
	textPosition?: Vector2d;
}

export class PdfTextImpl implements PdfText {
	private readonly _id: string;
	private readonly _position: Vector2d;
	private readonly _size: Vector2d;

	constructor(private readonly options: PdfTextImplOptions) {
		this._id = v4();

		if (options.textPosition) {
			this._position = options.textPosition;
		} else {
			this._position = root();
		}

		if (options.size) {
			this._size = options.size;
		} else {
			this._size = options.font.sizeOfText(options.text);
		}
	}

	id(): string {
		return this._id;
	}

	size(): Vector2d {
		return this._size;
	}

	position(): Vector2d {
		return this._position;
	}

	text(): string {
		return this.options.text;
	}

	font(): PdfFont {
		return this.options.font;
	}

	color(): PdfColor {
		return this.options.color;
	}
}

export function text(text: string, font: PdfFont, color: PdfColor): PdfText {
	return new PdfTextImpl({
		text,
		font,
		color,
	});
}

export function centeredText(text: string, font: PdfFont, color: PdfColor, size: Vector2d): PdfText {

	const actualSize = font.sizeOfText(text);
	const offset = size.add(actualSize.negate()).scale(0.5);

	return new PdfTextImpl({
		text,
		font,
		color,
		size,
		textPosition: offset,
	});
}
