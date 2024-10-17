import { type Vector2d } from "@/pdflib2/Vector2d";

export interface PdfFont {
	ref(): string;

	name(): string;

	fontSize(): number;

	sizeOfText(text: string): Vector2d;

	splitIntoLines(text: string, width: number): string[];

	atSize(size: number): PdfFont;
}

export interface PdfFontImplOptions {
	name: string;
	sizeOfTextGetter: (text: string, dtp: number) => Vector2d;
	splitIntoLines: (text: string, dtp: number, width: number) => string[];
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

	splitIntoLines(text: string, width: number): string[] {
		return this.options.splitIntoLines(text, this.fontSize(), width);
	}

	atSize(size: number): PdfFont {
		return new PdfFontImpl({
			...this.options,
			size: size,
		});
	}
}
