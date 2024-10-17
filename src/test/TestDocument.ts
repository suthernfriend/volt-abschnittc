import { PdfDocumentManagerImpl } from "@/pdflib2/PdfDocumentManager";

import { PdfPageWriter } from "@/pdflib2/PdfPageWriter";
import { text } from "@/pdflib2/PdfText";
import { writeFile } from "fs/promises";

async function main() {

	const documentManager = new PdfDocumentManagerImpl();

	const doc = documentManager.create();

	const page = doc.addPage();
	const font = documentManager.font("Ubuntu Regular");

	const writer = new PdfPageWriter(page);

	const color = documentManager.color(0, 0, 0);
	writer.addObject(text("Hello, World!", font, color));

	const url = await documentManager.exportAsArrayBuffer(doc);
	await writeFile("./dist/output.pdf", Buffer.from(url));
	console.log("done", url);
}

main()
	.then(() => console.log("done"))
	.catch(console.error);
