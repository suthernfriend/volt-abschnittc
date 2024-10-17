import { vector4d, type Vector4d } from "@/pdflib2/Vector4d";
import { root, vector2d, type Vector2d } from "@/pdflib2/Vector2d";

export type PdfPageSizes = "A5" | "A5L" | "A4" | "A4L" | "A3" | "A3L";

export const PdfPageSizeMm: { [k in PdfPageSizes]: Vector2d } = {
	A5: vector2d(148, 210),
	A5L: vector2d(210, 148),
	A4: vector2d(210, 297),
	A4L: vector2d(297, 210),
	A3: vector2d(297, 420),
	A3L: vector2d(420, 297),
};

export type PdfPageGeometries = "A5" | "A4" | "A4L_2" | "A3L_2" | "A3L_3";

export const PdfPageGeometryDescriptions: { [k in PdfPageGeometries]: string } = {
	A5: "1 Spalte auf A5",
	A4: "1Spalte auf A4",
	A4L_2: "2 Spalten auf A4 Querformat",
	A3L_2: "2 Spalten auf A3 Querformat",
	A3L_3: "3 Spalten auf A3 Querformat",
};

const oneThirdA3Width = PdfPageSizeMm.A3L.width() * (1 / 3);

export interface PdfPageGeometry {
	size(): Vector2d;

	geometries(): Vector4d[];

	padding(top: number, right: number, bottom: number, left: number): PdfPageGeometry;
}

class PdfPageGeometryImpl implements PdfPageGeometry {
	constructor(private readonly options: { size: Vector2d; geometries: Vector4d[] }) {}

	size(): Vector2d {
		return this.options.size;
	}

	geometries(): Vector4d[] {
		return this.options.geometries;
	}

	padding(top: number, right: number, bottom: number, left: number): PdfPageGeometry {
		return new PdfPageGeometryImpl({
			size: this.options.size,
			geometries: this.options.geometries.map((value) => {
				return vector4d(value.topLeft().add(vector2d(left, top)), value.size().add(vector2d(-left - right, -top - bottom)));
			}),
		});
	}
}

export const PdfGeometries: { [k in PdfPageGeometries]: PdfPageGeometry } = {
	A5: new PdfPageGeometryImpl({ size: PdfPageSizeMm.A5, geometries: [vector4d(root(), PdfPageSizeMm.A5)] }),
	A4: new PdfPageGeometryImpl({ size: PdfPageSizeMm.A4, geometries: [vector4d(root(), PdfPageSizeMm.A4)] }),
	A4L_2: new PdfPageGeometryImpl({
		size: PdfPageSizeMm.A4L,
		geometries: [vector4d(root(), PdfPageSizeMm.A5), vector4d(vector2d(PdfPageSizeMm.A5.width(), 0), PdfPageSizeMm.A5)],
	}),
	A3L_2: new PdfPageGeometryImpl({
		size: PdfPageSizeMm.A3L,
		geometries: [vector4d(root(), PdfPageSizeMm.A4), vector4d(vector2d(PdfPageSizeMm.A4.width(), 0), PdfPageSizeMm.A4)],
	}),
	A3L_3: new PdfPageGeometryImpl({
		size: PdfPageSizeMm.A3L,
		geometries: [
			vector4d(root(), vector2d(oneThirdA3Width, PdfPageSizeMm.A3L.height())),
			vector4d(oneThirdA3Width, 0, oneThirdA3Width, PdfPageSizeMm.A3L.height()),
			vector4d(oneThirdA3Width * 2, 0, oneThirdA3Width, PdfPageSizeMm.A3L.height()),
		],
	}),
};
