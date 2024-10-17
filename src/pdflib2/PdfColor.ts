export interface PdfColor {
	red(): number;

	green(): number;

	blue(): number;
}

export class PdfColorImpl implements PdfColor {
	private readonly _red: number;
	private readonly _green: number;
	private readonly _blue: number;

	constructor(red: number, green: number, blue: number) {
		this._red = red;
		this._green = green;
		this._blue = blue;
	}

	red(): number {
		return this._red;
	}

	green(): number {
		return this._green;
	}

	blue(): number {
		return this._blue;
	}
}

export function color(red: number, green: number, blue: number): PdfColor {
	return new PdfColorImpl(red, green, blue);
}
