import { GeneratePdfOptions, LINE_HEIGHT, MultipleChoicesQuestion, PAGE_MARGIN, PageElement } from "../types";
import { jsPDF } from "jspdf";

export class MultipleChoicesQuestionElement extends PageElement {
  private question: MultipleChoicesQuestion;
  private shuffledChoices: string[];

  constructor(doc: jsPDF, options: GeneratePdfOptions, question: MultipleChoicesQuestion) {
    super(doc, options);
    this.question = question;
    this.shuffledChoices = [...question.choices].sort(() => Math.random() - 0.5);
  }

  calculateRequiredHeight(): number {
    const PADDING_BETWEEN_AREAS = 24;
    const availableWidth = this.pageWidth - PAGE_MARGIN * 2;
    const answerAreaWidth = availableWidth * 0.2;
    const questionAreaWidth = availableWidth - answerAreaWidth - PADDING_BETWEEN_AREAS;

    const questionLines = this.doc.splitTextToSize(this.question.questionText, questionAreaWidth);
    const questionTextHeight = questionLines.length * LINE_HEIGHT;

    const choicesText = this.shuffledChoices.map((choice, i) => `${i + 1}. ${choice}`).join("   ");
    const choiceLines = this.doc.splitTextToSize(choicesText, questionAreaWidth);
    const choicesHeight = choiceLines.length * LINE_HEIGHT;

    return questionTextHeight + choicesHeight + LINE_HEIGHT;
  }

  render(y: number): number {
    const blockStartY = y;
    const PADDING_BETWEEN_AREAS = 24;
    const availableWidth = this.pageWidth - PAGE_MARGIN * 2;
    const answerAreaWidth = availableWidth * 0.2;
    const questionAreaWidth = availableWidth - answerAreaWidth - PADDING_BETWEEN_AREAS;

    // Answer Area (Right)
    const answerAreaX = this.pageWidth - PAGE_MARGIN - answerAreaWidth;
    this.doc.text("Ans:", answerAreaX, blockStartY);
    const ansTextWidth = this.doc.getTextWidth("Ans:");
    const answerLineXStart = answerAreaX + ansTextWidth + 2;
    const answerLineXEnd = this.pageWidth - PAGE_MARGIN;
    this.doc.line(answerLineXStart, blockStartY + 2, answerLineXEnd, blockStartY + 2);

    if (this.options.isAnswerMode) {
      const correctChoiceIndex = this.shuffledChoices.findIndex((c) => c === this.question.answer);
      if (correctChoiceIndex !== -1) {
        const correctNumber = (correctChoiceIndex + 1).toString();
        const answerText = `${correctNumber}. ${this.question.answer}`;
        this.doc.setTextColor(255, 0, 0);
        this.doc.text(answerText, answerLineXStart + 1, blockStartY);
        this.doc.setTextColor(0, 0, 0);
      }
    }

    // Question and Choices (Left)
    const questionLines = this.doc.splitTextToSize(this.question.questionText, questionAreaWidth);
    const questionTextHeight = questionLines.length * LINE_HEIGHT;
    this.doc.text(questionLines, PAGE_MARGIN, blockStartY);

    const choicesText = this.shuffledChoices.map((choice, i) => `${i + 1}. ${choice}`).join("   ");
    const choiceLines = this.doc.splitTextToSize(choicesText, questionAreaWidth);
    const choicesY = blockStartY + questionTextHeight + LINE_HEIGHT / 2;
    this.doc.text(choiceLines, PAGE_MARGIN, choicesY);

    return y + this.calculateRequiredHeight() + LINE_HEIGHT;
  }

  getElements(): PageElement[] {
    return [this];
  }
}
