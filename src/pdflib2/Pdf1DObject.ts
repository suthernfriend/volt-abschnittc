import type { Vector2d } from "@/pdflib2/Vector2d";

import type { PdfObject } from "@/pdflib2/PdfObject";

export interface Pdf1DObject extends PdfObject {
	vector(): Vector2d;
}
