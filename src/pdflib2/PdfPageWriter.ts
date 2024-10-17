import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import { vector2d } from "@/pdflib2/Vector2d";
import type { PdfPage } from "@/pdflib2/PdfPage";

export class PdfPageWriter {
	private x: number = 0;
	private y: number = 0;

	constructor(private page: PdfPage) {
	}

	public setY(y: number): void {
		this.y = y;
	}

	public skipY(dy: number): void {
		this.y += dy;
	}

	public addObject<T extends Pdf2DObject>(object: T): void {
		this.page.addFixedObject(vector2d(this.x, this.y), object);
		this.y += object.size().height();
	}
}
