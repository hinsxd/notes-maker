import { GeneratePdfOptions, LINE_HEIGHT, PAGE_MARGIN, PageElement } from "../types";
import { jsPDF } from "jspdf";

export class HeadingElement extends PageElement {
  public text: string;

  constructor(doc: jsPDF, options: GeneratePdfOptions, text: string) {
    super(doc, options);
    this.text = text;
  }

  calculateRequiredHeight(): number {
    return LINE_HEIGHT * 1.5;
  }

  render(y: number): number {
    this.doc.setFont(this.doc.getFont().fontName, "bold");
    this.doc.text(this.text, PAGE_MARGIN, y);
    this.doc.setFont(this.doc.getFont().fontName, "normal");

    return y + this.calculateRequiredHeight();
  }

  getElements(): PageElement[] {
    return [this];
  }
}
