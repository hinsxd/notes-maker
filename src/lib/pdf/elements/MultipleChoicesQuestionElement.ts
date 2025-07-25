import { MultipleChoicesQuestion } from "@/lib/pdf/validation";

import { GeneratePdfOptions, LINE_HEIGHT, PAGE_MARGIN, QuestionElement } from "../types";
import { jsPDF } from "jspdf";

const PADDING_BETWEEN_AREAS = 24;
const CHOICE_PADDING = 4;

export class MultipleChoicesQuestionElement extends QuestionElement<MultipleChoicesQuestion> {
  private shuffledChoices: string[];
  private choicesPerLine: number;

  private questionAreaWidth: number;

  constructor(doc: jsPDF, options: GeneratePdfOptions, question: MultipleChoicesQuestion, questionNumber?: string) {
    super(doc, options, question, questionNumber);
    this.shuffledChoices = [...question.choices].sort(() => Math.random() - 0.5);
    const availableWidth = this.pageWidth - PAGE_MARGIN * 2 - this.questionNumberWidth;
    const answerAreaWidth = availableWidth * 0.2;
    this.questionAreaWidth = availableWidth - answerAreaWidth - PADDING_BETWEEN_AREAS;

    const choiceTextLengths = this.shuffledChoices.map((c) => this.doc.getTextWidth(`1. ${c}`));
    const maxChoiceTextLength = Math.max(...choiceTextLengths);

    this.choicesPerLine = 1;
    if (maxChoiceTextLength < (this.questionAreaWidth - CHOICE_PADDING) / 2) {
      this.choicesPerLine = 2;
    }
    if (maxChoiceTextLength < (this.questionAreaWidth - 3 * CHOICE_PADDING) / 4) {
      this.choicesPerLine = 4;
    }
  }

  calculateRequiredHeight(): number {
    const availableWidth = this.pageWidth - PAGE_MARGIN * 2 - this.questionNumberWidth;
    const answerAreaWidth = availableWidth * 0.2;
    const questionAreaWidth = availableWidth - answerAreaWidth - PADDING_BETWEEN_AREAS;

    const { questionText } = this.question;
    const questionLines = this.doc.splitTextToSize(questionText, questionAreaWidth);
    const questionTextHeight = questionLines.length * LINE_HEIGHT;

    const choicesHeight = Math.ceil(this.shuffledChoices.length / this.choicesPerLine) * LINE_HEIGHT;

    return questionTextHeight + choicesHeight + LINE_HEIGHT;
  }

  render(y: number): number {
    y = this.addPageIfNeeded(y, this.calculateRequiredHeight());
    if (this.questionNumber) {
      this.doc.text(this.questionNumber, PAGE_MARGIN, y);
    }
    const blockStartY = y;
    const PADDING_BETWEEN_AREAS = 6;
    const availableWidth = this.pageWidth - PAGE_MARGIN * 2 - this.questionNumberWidth;
    const answerAreaWidth = availableWidth * 0.2;
    const questionAreaWidth = availableWidth - answerAreaWidth - PADDING_BETWEEN_AREAS;

    // Answer Area (Right)
    const answerAreaX = this.pageWidth - PAGE_MARGIN - answerAreaWidth;
    this.doc.text("答:", answerAreaX, blockStartY);
    const ansTextWidth = this.doc.getTextWidth("答:");
    const answerLineXStart = answerAreaX + ansTextWidth + 2;
    const answerLineXEnd = this.pageWidth - PAGE_MARGIN;
    this.doc.line(answerLineXStart, blockStartY + 2, answerLineXEnd, blockStartY + 2);

    if (this.options.isAnswerMode) {
      const correctChoiceIndex = this.shuffledChoices.findIndex((c) => c === this.question.answer);
      if (correctChoiceIndex !== -1) {
        const correctNumber = (correctChoiceIndex + 1).toString();
        const answerText = `${correctNumber}`;
        this.doc.setTextColor(255, 0, 0);
        this.doc.text(answerText, answerLineXStart + 1, blockStartY);
        this.doc.setTextColor(0, 0, 0);
      }
    }

    // Question and Choices (Left)
    const questionLinesToRender = this.doc.splitTextToSize(this.question.questionText, questionAreaWidth);
    const questionTextHeight = questionLinesToRender.length * LINE_HEIGHT;
    this.doc.text(questionLinesToRender, this.questionStartX, blockStartY);

    const choicesText = this.shuffledChoices.map((choice, i) => `${i + 1}. ${choice}`);

    const choicesStartY = blockStartY + questionTextHeight;

    let lineCount = 0;
    for (let i = 0; i < choicesText.length; i += this.choicesPerLine) {
      const choices = choicesText.slice(i, i + this.choicesPerLine);
      choices.forEach((choice, i) => {
        this.doc.text(
          choice,
          this.questionStartX + (this.questionAreaWidth / this.choicesPerLine) * (i % this.choicesPerLine),
          choicesStartY + lineCount * (LINE_HEIGHT * 1.2),
        );
      });
      lineCount++;
    }

    return choicesStartY + lineCount * LINE_HEIGHT + LINE_HEIGHT;
  }
}
