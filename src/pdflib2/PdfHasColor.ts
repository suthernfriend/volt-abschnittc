import type { PdfColor } from "@/pdflib2/PdfColor";

export interface PdfHasColor {
	color(): PdfColor;
}

export interface PdfHasFontSize {
	fontSize(): number;
}
