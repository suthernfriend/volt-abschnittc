import { vector2d, type Vector2d } from "@/pdflib2/Vector2d";
import { type PdfPositionedObject, positionedObject } from "@/pdflib2/PdfPositionedObject";
import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import { v4 } from "uuid";

export interface PdfObjectGroup extends Pdf2DObject {
	addFlow(obj: Pdf2DObject): PdfObjectGroup;
	addFlow(objs: Pdf2DObject[]): PdfObjectGroup;

	addRelative(obj: Pdf2DObject, relativePosition: Vector2d): PdfObjectGroup;

	children(): PdfPositionedObject<Pdf2DObject>[];
}

export class PdfObjectGroupImpl implements PdfObjectGroup {
	private readonly _objects: PdfPositionedObject<Pdf2DObject>[] = [];
	private y: number = 0;
	private _id: string;

	constructor() {
		this._id = v4();
	}

	ref(): string {
		return this._id;
	}

	children(): PdfPositionedObject<Pdf2DObject>[] {
		return [...this._objects];
	}

	addFlow(obj: Pdf2DObject | Pdf2DObject[]): PdfObjectGroup {
		if (Array.isArray(obj)) {
			for (const o of obj) {
				this.addFlow(o);
			}
		} else {
			this._objects.push(positionedObject(vector2d(0, this.y), obj));
			this.y += obj.size().height();
		}
		return this;
	}

	addRelative(obj: Pdf2DObject, relativePosition: Vector2d): PdfObjectGroup {
		this._objects.push(positionedObject(relativePosition, obj));
		return this;
	}

	size(): Vector2d {
		if (this._objects.length === 1) return this._objects[0].object().size();

		let largestY = 0;
		let largestX = 0;

		for (const posObj of this._objects) {
			const position = posObj.position();
			const size = posObj.object().size();

			const right = position.x() + size.width();
			const bottom = position.y() + size.height();

			largestY = Math.max(largestY, bottom);
			largestX = Math.max(largestX, right);
		}

		return vector2d(largestX, largestY);
	}
}

export function objectGroup(): PdfObjectGroup {
	return new PdfObjectGroupImpl();
}

export function isPdfObjectGroup(object: any): object is PdfObjectGroup {
	return object instanceof PdfObjectGroupImpl;
}
