import { isPdf2DObject, type Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import type { PdfColor } from "@/pdflib2/PdfColor";
import { v4 } from "uuid";
import { root, vector2d, type Vector2d } from "@/pdflib2/Vector2d";
import type { PdfFont } from "@/pdflib2/PdfFont";
import { objectGroup, type PdfObjectGroup } from "@/pdflib2/PdfObjectGroup";

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

	ref(): string {
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

export function rightAlignedText(text: string, font: PdfFont, color: PdfColor, width: number): PdfText {
	const actualSize = font.sizeOfText(text);
	const offset = vector2d(width - actualSize.x(), 0);

	return new PdfTextImpl({
		text,
		font,
		color,
		size: vector2d(width, actualSize.y()),
		textPosition: offset,
	});
}

export function mapMultilineText(font: PdfFont, color: PdfColor, maxWidth: number): (text: string) => PdfObjectGroup {
	return (text: string) => multilineText(text, font, color, maxWidth);
}

export function multilineText(mlText: string, font: PdfFont, color: PdfColor, maxWidth: number): PdfObjectGroup {
	const lines = font.splitIntoLines(mlText, maxWidth);

	console.log(`lines: ${lines}`);

	const group = objectGroup();

	for (const line of lines)
		group.addFlow(text(line, font, color));

	return group;
}
