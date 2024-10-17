import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import { vector2d } from "@/pdflib2/Vector2d";
import type { PdfPage } from "@/pdflib2/PdfPage";

export class PdfPageWriter {
	private x: number = 0;
	private y: number = 0;

	constructor(private page: PdfPage) {}

	public setY(y: number): PdfPageWriter {
		this.y = y;
		return this;
	}

	public skipY(dy: number): PdfPageWriter {
		this.y += dy;
		return this;
	}

	public addObject<T extends Pdf2DObject>(object: T): PdfPageWriter {
		this.page.addFixedObject(vector2d(this.x, this.y), object);
		this.y += object.size().height();
		return this;
	}
}
