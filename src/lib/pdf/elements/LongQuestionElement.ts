import { GeneratePdfOptions, LINE_HEIGHT, LongQuestion, PAGE_MARGIN, PageElement } from "../types";
import { jsPDF } from "jspdf";

export class LongQuestionElement extends PageElement {
  private question: LongQuestion;

  constructor(doc: jsPDF, options: GeneratePdfOptions, question: LongQuestion) {
    super(doc, options);
    this.question = question;
  }

  calculateRequiredHeight(): number {
    const questionLines = this.doc.splitTextToSize(this.question.questionText, this.pageWidth - PAGE_MARGIN * 2);
    const questionTextHeight = questionLines.length * LINE_HEIGHT;
    const answerAreaHeight = LINE_HEIGHT / 2 + LINE_HEIGHT * 2;

    return questionTextHeight + answerAreaHeight;
  }

  render(y: number): number {
    y = this.addPageIfNeeded(y, this.calculateRequiredHeight());
    const questionLines = this.doc.splitTextToSize(this.question.questionText, this.pageWidth - PAGE_MARGIN * 2);

    this.doc.text(questionLines, PAGE_MARGIN, y);
    y += questionLines.length * LINE_HEIGHT;

    y += LINE_HEIGHT / 2;

    if (this.options.isAnswerMode) {
      this.doc.setTextColor(255, 0, 0);
      this.doc.text(this.question.answer, PAGE_MARGIN, y);
      this.doc.setTextColor(0, 0, 0);
    }

    this.doc.line(PAGE_MARGIN, y + 2, this.pageWidth - PAGE_MARGIN, y + 2);
    y += LINE_HEIGHT * 2;

    return y;
  }
}
