import { PdfFormData } from "@/lib/pdf/validation";

import { createPageElement } from "./createPageElement";
import { font as NotoSerifJPBold } from "./fonts/NotoSerifJP-Bold-normal";
import { font as NotoSerifJPMedium } from "./fonts/NotoSerifJP-Medium-normal";
import { font as NotoSerifJPRegular } from "./fonts/NotoSerifJP-Regular-normal";
import { DocumentItem, FONT_SIZE, GeneratePdfOptions, LINE_HEIGHT, PAGE_MARGIN } from "./types";
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

    this.doc.addFileToVFS("NotoSerifJP-Regular-normal.ttf", NotoSerifJPRegular);
    this.doc.addFileToVFS("NotoSerifJP-Medium-normal.ttf", NotoSerifJPMedium);
    this.doc.addFileToVFS("NotoSerifJP-Bold-normal.ttf", NotoSerifJPBold);

    this.doc.addFont("NotoSerifJP-Regular-normal.ttf", "NotoSerifJP", "normal");
    this.doc.addFont("NotoSerifJP-Medium-normal.ttf", "NotoSerifJP", "medium");
    this.doc.addFont("NotoSerifJP-Bold-normal.ttf", "NotoSerifJP", "bold");

    this.doc.setFont("NotoSerifJP");
  }

  renderTitle(title: string, y: number): number {
    this.doc.setFontSize(FONT_SIZE * 1.5);
    this.doc.setFont(this.doc.getFont().fontName, "bold");

    this.doc.text(title, PAGE_MARGIN, y);

    this.doc.setFontSize(FONT_SIZE);
    this.doc.setFont(this.doc.getFont().fontName, "normal");

    return y + LINE_HEIGHT * 1.5;
  }

  generate(data: PdfFormData) {
    const { items, title } = data;
    let y = PAGE_MARGIN;

    y = this.renderTitle(title, y);

    const elements = items.map((item) => createPageElement(this.doc, this.options, item));

    elements.forEach((element) => {
      y = element.render(y);
    });

    return this.doc.output("arraybuffer");
  }
}

export const generatePdf = (data: PdfFormData, options: GeneratePdfOptions) => {
  const generator = new PdfGenerator(options);

  return generator.generate(data);
};
