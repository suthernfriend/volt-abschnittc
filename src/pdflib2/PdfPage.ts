import { type Vector2d } from "@/pdflib2/Vector2d";
import type { PdfObject } from "@/pdflib2/PdfObject";
import { type PdfPositionedObject, positionedObject } from "@/pdflib2/PdfPositionedObject";

export interface PdfPage {
	objects(): PdfPositionedObject<PdfObject>[];

	addFixedObject(position: Vector2d, object: PdfObject): void;
}

export class PdfPageImpl implements PdfPage {
	private readonly _objects: PdfPositionedObject<PdfObject>[] = [];

	addFixedObject(position: Vector2d, object: PdfObject): void {
		this._objects.push(positionedObject(position, object));
	}

	public objects(): PdfPositionedObject<PdfObject>[] {
		return [...this._objects];
	}
}
