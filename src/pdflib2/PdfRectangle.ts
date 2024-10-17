import type { Vector2d } from "@/pdflib2/Vector2d";
import type { PdfColor } from "@/pdflib2/PdfColor";
import { v4 } from "uuid";
import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";

export interface PdfRectangle extends Pdf2DObject {
	lineWidth(): number;

	color(): PdfColor;

	isFilled(): boolean;

	fillColor(): PdfColor;
}

export interface PdfRectangleImplOptions {
	size: Vector2d;
	lineWidth: number;
	color: PdfColor;
	isFilled: boolean;
	fillColor: PdfColor;
}

export class PdfRectangleImpl implements PdfRectangle {
	private readonly _id: string;

	constructor(private readonly options: PdfRectangleImplOptions) {
		this._id = v4();
	}

	ref(): string {
		return this._id;
	}

	size(): Vector2d {
		return this.options.size;
	}

	lineWidth(): number {
		return this.options.lineWidth;
	}

	color(): PdfColor {
		return this.options.color;
	}

	isFilled(): boolean {
		return this.options.isFilled;
	}

	fillColor(): PdfColor {
		return this.options.fillColor;
	}
}

export function fillRect(size: Vector2d, color: PdfColor): PdfRectangle {
	return new PdfRectangleImpl({
		size,
		lineWidth: 0,
		color,
		isFilled: true,
		fillColor: color,
	});
}

export function strokeRect(size: Vector2d, lineWidth: number, color: PdfColor): PdfRectangle {
	return new PdfRectangleImpl({
		size,
		lineWidth,
		color,
		isFilled: false,
		fillColor: color,
	});
}

export function isPdfRectangle(obj: any): obj is PdfRectangle {
	return obj instanceof PdfRectangleImpl;
}
