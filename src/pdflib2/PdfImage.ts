import type { Vector2d } from "@/pdflib2/Vector2d";

import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";

export interface PdfImage extends Pdf2DObject {
	source(): string;

	size(): Vector2d;
}
