import { type Vector2d } from "@/pdflib2/Vector2d";
import type { PdfObject } from "@/pdflib2/PdfObject";
import { type PdfPositionedObject, positionedObject } from "@/pdflib2/PdfPositionedObject";

export interface PdfPage {
	objects(): PdfPositionedObject<PdfObject>[];

	addFixedObject(position: Vector2d, object: PdfObject): PdfPage;

	size(): Vector2d;
}

export interface PdfPageImplOptions {
	size: Vector2d;
}

export class PdfPageImpl implements PdfPage {
	private readonly _objects: PdfPositionedObject<PdfObject>[] = [];

	constructor(private readonly options: PdfPageImplOptions) {}

	addFixedObject(position: Vector2d, object: PdfObject): PdfPage {
		this._objects.push(positionedObject(position, object));
		return this;
	}

	public objects(): PdfPositionedObject<PdfObject>[] {
		return [...this._objects];
	}

	size(): Vector2d {
		return this.options.size;
	}
}
