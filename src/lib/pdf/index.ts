import { createPageElement } from "./createPageElement";
import { DocumentItem, FONT_SIZE, GeneratePdfOptions, PAGE_MARGIN, PageElement } from "./types";
import { jsPDF } from "jspdf";

export * from "./types";
export * from "./data";

class PdfGenerator {
  private doc: jsPDF;
  private y: number;
  private options: GeneratePdfOptions;
  private pageHeight: number;

  constructor(options: GeneratePdfOptions) {
    this.doc = new jsPDF();
    this.options = options;
    this.y = PAGE_MARGIN;
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.doc.setFontSize(FONT_SIZE);
  }

  private addPageIfNeeded(contentHeight: number) {
    if (this.y + contentHeight > this.pageHeight - PAGE_MARGIN) {
      this.doc.addPage();
      this.y = PAGE_MARGIN;
    }
  }

  private renderElement(element: PageElement) {
    console.log("[PdfGenerator] renderElement", element.constructor.name, element);
    const elementHeight = element.calculateRequiredHeight();
    console.log("[PdfGenerator] elementHeight", elementHeight);
    this.addPageIfNeeded(elementHeight);
    this.y = element.render(this.y);
  }

  generate(items: DocumentItem[]) {
    const elements = items
      .map((item) => createPageElement(this.doc, this.options, item))
      .flatMap((element) => element.getElements());

    elements.forEach((element) => {
      this.renderElement(element);
    });

    this.doc.save("student-exercises.pdf");
  }
}

export const generatePdf = (items: DocumentItem[], options: GeneratePdfOptions) => {
  const generator = new PdfGenerator(options);
  generator.generate(items);
};
