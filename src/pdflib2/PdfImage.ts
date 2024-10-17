import { vector2d, type Vector2d } from "@/pdflib2/Vector2d";

import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";

export interface PdfImage extends Pdf2DObject {
	size(): Vector2d;

	atSize(size: Vector2d): PdfImage;
	
	atWidth(width: number): PdfImage;
	
	atHeight(height: number): PdfImage;
}

export interface PdfImageImplOptions {
	ref: string;
	size: Vector2d;
}

export class PdfImageImpl implements PdfImage {
	constructor(private readonly options: PdfImageImplOptions) {}

	ref(): string {
		return this.options.ref;
	}

	size(): Vector2d {
		return this.options.size;
	}

	atHeight(height: number): PdfImage {
		const width = (height / this.options.size.y()) * this.options.size.x();
		return new PdfImageImpl({
			...this.options,
			size: vector2d(width, height)
		});
	}

	atWidth(width: number): PdfImage {
		const height = (width / this.options.size.x()) * this.options.size.y();
		return new PdfImageImpl({
			...this.options,
			size: vector2d(width, height),
		});
	}

	atSize(size: Vector2d): PdfImage {
		return new PdfImageImpl({
			...this.options,
			size,
		});
	}
}

export function isPdfImage(object: any): object is PdfImage {
	return object instanceof PdfImageImpl;
}
