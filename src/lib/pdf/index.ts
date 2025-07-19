import { createPageElement } from "./createPageElement";
import { DocumentItem, FONT_SIZE, GeneratePdfOptions, PAGE_MARGIN } from "./types";
import { jsPDF } from "jspdf";

export * from "./types";
export * from "./data";

class PdfGenerator {
  private doc: jsPDF;
  private options: GeneratePdfOptions;

  constructor(options: GeneratePdfOptions) {
    this.doc = new jsPDF();
    this.options = options;
    this.doc.setFontSize(FONT_SIZE);
  }

  generate(items: DocumentItem[]) {
    const elements = items.map((item) => createPageElement(this.doc, this.options, item));

    let y = PAGE_MARGIN;
    elements.forEach((element) => {
      y = element.render(y);
    });

    this.doc.save("student-exercises.pdf");
  }
}

export const generatePdf = (items: DocumentItem[], options: GeneratePdfOptions) => {
  const generator = new PdfGenerator(options);
  generator.generate(items);
};
