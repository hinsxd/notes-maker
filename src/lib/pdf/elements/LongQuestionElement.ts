import { GeneratePdfOptions, LINE_HEIGHT, LongQuestion, PAGE_MARGIN, QuestionElement } from "../types";
import { jsPDF } from "jspdf";

export class LongQuestionElement extends QuestionElement<LongQuestion> {
  constructor(doc: jsPDF, options: GeneratePdfOptions, question: LongQuestion, questionNumber?: string) {
    super(doc, options, question, questionNumber);
  }

  calculateRequiredHeight(): number {
    const questionLines = this.doc.splitTextToSize(
      this.question.questionText,
      this.pageWidth - PAGE_MARGIN * 2 - this.questionNumberWidth,
    );
    const questionTextHeight = questionLines.length * LINE_HEIGHT;
    const answerAreaHeight = LINE_HEIGHT / 2 + LINE_HEIGHT * 2;

    return questionTextHeight + answerAreaHeight;
  }

  render(y: number): number {
    y = this.addPageIfNeeded(y, this.calculateRequiredHeight());

    const { questionText } = this.question;

    const questionLines = this.doc.splitTextToSize(
      questionText,
      this.pageWidth - PAGE_MARGIN * 2 - this.questionNumberWidth,
    );

    if (this.questionNumber) {
      this.doc.text(this.questionNumber, PAGE_MARGIN, y);
    }

    this.doc.text(questionLines, this.questionStartX, y);
    y += questionLines.length * LINE_HEIGHT;

    y += LINE_HEIGHT / 2;

    if (this.options.isAnswerMode) {
      this.doc.setTextColor(255, 0, 0);
      this.doc.text(this.question.answer, this.questionStartX, y);
      this.doc.setTextColor(0, 0, 0);
    }

    this.doc.line(this.questionStartX, y + 2, this.pageWidth - PAGE_MARGIN, y + 2);
    y += LINE_HEIGHT * 2;

    return y;
  }
}
