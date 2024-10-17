import { vector2d, type Vector2d } from "@/pdflib2/Vector2d";
import type { Pdf2DObject } from "@/pdflib2/Pdf2DObject";
import type { PdfObject } from "@/pdflib2/PdfObject";
import type { PdfDocument } from "@/pdflib2/PdfDocument";
import { vector4d } from "@/pdflib2/Vector4d";
import type { PdfPageGeometry } from "@/pdflib2/PdfGeometries";
import { strokeRect } from "@/pdflib2/PdfRectangle";
import { color } from "@/pdflib2/PdfColor";

export interface PdfBufferedVirtualWriterImplOptions {
	pageGeometry: PdfPageGeometry;
	debug?: boolean;
}

export interface PdfBufferedVirtualWriter {
	addObject<T extends Pdf2DObject>(object: T): PdfBufferedVirtualWriter;

	onEachPage<T extends PdfObject>(obj: T, topLeft: Vector2d): PdfBufferedVirtualWriter;

	complete(document: PdfDocument): void;

	safeGeometryWidth(): number;
}

export function pdfVirtualWriter(pageGeometry: PdfPageGeometry, debug: boolean = false): PdfBufferedVirtualWriter {
	return new PdfBufferedVirtualWriterImpl({
		pageGeometry,
		debug,
	});
}

export class PdfBufferedVirtualWriterImpl implements PdfBufferedVirtualWriter {

	private objects: Pdf2DObject[] = [];
	private eachPage: { obj: PdfObject; topLeft: Vector2d }[] = [];

	constructor(private options: PdfBufferedVirtualWriterImplOptions) {}

	addObject<T extends Pdf2DObject>(object: T): PdfBufferedVirtualWriter {
		this.objects.push(object);
		return this;
	}

	onEachPage<T extends PdfObject>(obj: T, topLeft: Vector2d): PdfBufferedVirtualWriter {
		this.eachPage.push({ obj, topLeft });
		return this;
	}

	safeGeometryWidth(): number {

		let smallestWidth = Infinity;

		for (const geometry of this.options.pageGeometry.geometries()) {
			const width = geometry.size().width();
			if (width < smallestWidth) {
				smallestWidth = width;
			}
		}

		return smallestWidth;
	}

	getNext(page: number, geometry: number): { page: number; geometry: number; offsetY: number } {
		const geometries = this.options.pageGeometry.geometries();
		const nextGeometry = geometry + 1;
		const pageHeight = geometries.reduce((acc, g) => acc + g.height(), 0);

		if (nextGeometry < geometries.length) {
			let offsetY = pageHeight * page;
			for (let i = 0; i < nextGeometry; i++) {
				offsetY += geometries[i].height();
			}

			return { page, geometry: nextGeometry, offsetY };
		} else {
			return { page: page + 1, geometry: 0, offsetY: pageHeight * (page + 1) };
		}
	}

	yToPageNrAndGeomNr(y: number): {
		page: number;
		geo: number;
		pageOffset: number;
		geometryOffset: number;
	} {
		let page = 0;
		let pageOffset = 0; // always contains the height above the current page
		let geometryOffset = 0; // always contains the height above the current geometry

		const geometries = this.options.pageGeometry.geometries();

		while (true) {
			for (let geoNr = 0; geoNr < geometries.length; geoNr++) {
				// offsetY is the top of the geometry
				const geometryHeight = geometries[geoNr].height();

				const top = geometryOffset;
				const bottom = geometryOffset + geometryHeight;

				if (y >= top && y < bottom) {
					const inGeom = y - top;
					const inPage = y - pageOffset;

					console.log(`top: ${top}, y: ${y}, bottom: ${bottom} (in-geo: ${inGeom}, in-page: ${inPage})`);

					return { page, geo: geoNr, pageOffset: inPage, geometryOffset: inGeom };
				}

				geometryOffset += geometryHeight;
			}

			pageOffset = geometryOffset;
			page++;
		}
	}

	complete(document: PdfDocument): void {
		let virtY = 0;

		for (const obj of this.objects) {
			const { page, geo, geometryOffset } = this.yToPageNrAndGeomNr(virtY);
			const geometry = this.options.pageGeometry.geometries()[geo];

			const tl = geometry.topLeft().add(vector2d(0, geometryOffset));
			console.log(`virtY: ${virtY}, tl: ${tl.toString()}`);
			const rect = vector4d(tl, obj.size());

			console.log(`page: ${page}, geo: ${geo}, ${rect.toString()}`);

			// if we have a page break at bottom ob rect, we skip to the next page
			if (rect.bottomLeft().y() > geometry.bottomLeft().y()) {
				const next = this.getNext(page, geo);
				const nextGeometry = this.options.pageGeometry.geometries()[next.geometry];
				const tl = nextGeometry.topLeft();
				const rect = vector4d(tl, obj.size());
				const pdfPage = document.getOrAddPage(next.page, this.options.pageGeometry.size());

				if (this.options.debug) {
					pdfPage
						.addFixedObject(nextGeometry.topLeft(), strokeRect(nextGeometry.size(), 1, color(1, 0, 0)))
						.addFixedObject(rect.topLeft(), strokeRect(rect.size(), 1, color(0, 1, 0)));
				}

				pdfPage.addFixedObject(rect.topLeft(), obj);
				virtY = next.offsetY + obj.size().height();
			} else {
				const pdfPage = document.getOrAddPage(page, this.options.pageGeometry.size());

				if (this.options.debug)
					pdfPage
						.addFixedObject(geometry.topLeft(), strokeRect(geometry.size(), 1, color(1, 0, 0)))
						.addFixedObject(rect.topLeft(), strokeRect(rect.size(), 1, color(0, 0.8, 0.1)));

				pdfPage.addFixedObject(rect.topLeft(), obj);

				virtY += obj.size().height();
			}
		}
	}
}
