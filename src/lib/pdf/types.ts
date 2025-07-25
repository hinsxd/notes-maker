import { Question } from "@/lib/pdf/validation";

import { jsPDF } from "jspdf";

export type GeneratePdfOptions = {
  isAnswerMode: boolean;
};

// -----------------
// Constants
// -----------------

export const FONT_SIZE = 12;
export const LINE_HEIGHT = 7;
export const PAGE_MARGIN = 20;
export const QUESTION_NUMBER_WIDTH = 6;

// -----------------
// Base Class
// -----------------

export abstract class PageElement {
  protected doc: jsPDF;
  protected options: GeneratePdfOptions;
  protected pageWidth: number;
  protected pageHeight: number;

  constructor(doc: jsPDF, options: GeneratePdfOptions) {
    this.doc = doc;
    this.options = options;
    this.pageWidth = doc.internal.pageSize.getWidth();
    this.pageHeight = doc.internal.pageSize.getHeight();
  }

  protected addPageIfNeeded(y: number, requiredHeight: number): number {
    if (y + requiredHeight > this.pageHeight - PAGE_MARGIN) {
      this.doc.addPage();

      return PAGE_MARGIN;
    }

    return y;
  }

  abstract calculateRequiredHeight(): number;
  abstract render(y: number): number; // returns new y
}

export abstract class QuestionElement<Q extends Question> extends PageElement {
  protected questionNumberWidth: number;
  protected questionStartX: number;
  protected question: Q;
  protected questionNumber?: string;

  constructor(doc: jsPDF, options: GeneratePdfOptions, question: Q, questionNumber?: string) {
    super(doc, options);
    this.questionNumberWidth = questionNumber ? QUESTION_NUMBER_WIDTH : 0;
    this.questionStartX = PAGE_MARGIN + this.questionNumberWidth;
    this.question = question;
    this.questionNumber = questionNumber;
  }
}
