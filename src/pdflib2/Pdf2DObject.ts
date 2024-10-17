import type { Vector2d } from "@/pdflib2/Vector2d";

import type { PdfObject } from "@/pdflib2/PdfObject";

export interface Pdf2DObject extends PdfObject {
	size(): Vector2d;
}

export function isPdf2DObject(object: any): object is Pdf2DObject {
	return object != null && typeof object.size === "function";
}
