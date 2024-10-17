import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import type { Vector2d } from "@/pdflib2/Vector2d";
import { v4 } from "uuid";

export interface PdfWhitespace extends Pdf2DObject {}

export interface PdfWhitespaceImplOptions {
	size: Vector2d;
}

export class PdfWhitespaceImpl implements PdfWhitespace {
	private readonly _id: string;

	constructor(private readonly options: PdfWhitespaceImplOptions) {
		this._id = v4();
	}

	ref(): string {
		return this._id;
	}

	size(): Vector2d {
		return this.options.size;
	}
}

export function whitespace(size: Vector2d): PdfWhitespace {
	return new PdfWhitespaceImpl({
		size,
	});
}
