import { FillQuestion, GeneratePdfOptions, LINE_HEIGHT, PAGE_MARGIN, QuestionElement } from "../types";
import { FILL_PLACEHOLDER } from "../validation";
import { jsPDF } from "jspdf";

export class FillQuestionElement extends QuestionElement<FillQuestion> {
  constructor(doc: jsPDF, options: GeneratePdfOptions, question: FillQuestion, questionNumber?: string) {
    super(doc, options, question, questionNumber);
  }

  calculateRequiredHeight(): number {
    const questionText = this.options.isAnswerMode
      ? this.question.questionText.replace(FILL_PLACEHOLDER, this.question.answer)
      : this.question.questionText.replace(FILL_PLACEHOLDER, "(    )");

    const questionLines = this.doc.splitTextToSize(
      questionText,
      this.pageWidth - PAGE_MARGIN * 2 - this.questionNumberWidth,
    );
    const questionTextHeight = questionLines.length * LINE_HEIGHT;
    const answerAreaHeight = LINE_HEIGHT / 2;

    return questionTextHeight + answerAreaHeight;
  }

  render(y: number): number {
    y = this.addPageIfNeeded(y, this.calculateRequiredHeight());

    const { questionText, answer } = this.question;

    const displayText = this.options.isAnswerMode
      ? questionText.replace(FILL_PLACEHOLDER, answer)
      : questionText.replace(FILL_PLACEHOLDER, "(    )");

    const questionLines = this.doc.splitTextToSize(
      displayText,
      this.pageWidth - PAGE_MARGIN * 2 - this.questionNumberWidth,
    );

    if (this.questionNumber) {
      this.doc.text(this.questionNumber, PAGE_MARGIN, y);
    }

    if (this.options.isAnswerMode) {
      this.doc.setTextColor(255, 0, 0);
    }

    this.doc.text(questionLines, this.questionStartX, y);

    if (this.options.isAnswerMode) {
      this.doc.setTextColor(0, 0, 0);
    }
    y += questionLines.length * LINE_HEIGHT;

    y += LINE_HEIGHT / 2;

    return y;
  }
}
