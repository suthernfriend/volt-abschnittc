import { vector2d, type Vector2d } from "@/pdflib2/Vector2d";

export interface PdfFont {
	name(): string;

	fontSize(): number;

	sizeOfText(text: string): Vector2d;
}

export class PdfFontImpl implements PdfFont {
	private readonly _name: string;

	constructor(name: string) {
		this._name = name;
	}

	name(): string {
		return this._name;
	}

	sizeOfText(text: string): Vector2d {
		return vector2d(0, 0);
	}

	fontSize(): number {
		return 0;
	}
}
