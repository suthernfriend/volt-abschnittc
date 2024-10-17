import { type Vector2d } from "@/pdflib2/Vector2d";

export interface PdfFont {
	ref(): string;

	name(): string;

	fontSize(): number;

	sizeOfText(text: string): Vector2d;

	atSize(size: number): PdfFont;
}

export interface PdfFontImplOptions {
	name: string;
	sizeOfTextGetter: (text: string, dpt: number) => Vector2d;
	size: number;
	ref: string;
}

export class PdfFontImpl implements PdfFont {
	constructor(private readonly options: PdfFontImplOptions) {}

	ref(): string {
		return this.options.ref;
	}

	name(): string {
		return this.options.name;
	}

	sizeOfText(text: string): Vector2d {
		return this.options.sizeOfTextGetter(text, this.fontSize());
	}

	fontSize(): number {
		return this.options.size;
	}

	atSize(size: number): PdfFont {
		return new PdfFontImpl({
			ref: this.options.ref,
			name: this.options.name,
			sizeOfTextGetter: (text: string, dpt: number) => {
				return this.options.sizeOfTextGetter(text, size);
			},
			size: size,
		});
	}
}
