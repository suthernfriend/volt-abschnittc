import type { Vector2d } from "@/pdflib2/Vector2d";

import type { PdfObject } from "@/pdflib2/PdfObject";

export interface PdfPositionedObject<T extends PdfObject> {
	position(): Vector2d;

	object(): T;
}

export function positionedObject<T extends PdfObject>(position: Vector2d, object: T): PdfPositionedObject<T> {
	return {
		position: () => position,
		object: () => object,
	};
}
