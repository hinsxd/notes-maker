import { GeneratePdfOptions, LINE_HEIGHT, PageElement, Section } from "../types";
import { HeadingElement } from "./HeadingElement";
import { LongQuestionElement } from "./LongQuestionElement";
import { MultipleChoicesQuestionElement } from "./MultipleChoicesQuestionElement";
import { jsPDF } from "jspdf";

export class SectionElement extends PageElement {
  private section: Section;
  private childElements: PageElement[] = [];

  constructor(doc: jsPDF, options: GeneratePdfOptions, section: Section) {
    super(doc, options);
    this.section = section;
    const exampleOptions = { ...options, isAnswerMode: true };

    this.childElements.push(new HeadingElement(doc, options, section.description));

    if (section.exampleQuestions.length > 0) {
      this.childElements.push(new HeadingElement(doc, options, "例題:"));
      section.exampleQuestions.forEach((q, i) => {
        const questionNumber = `${i + 1}.`;
        if (q.type === "LongQuestion") {
          this.childElements.push(new LongQuestionElement(doc, exampleOptions, q, questionNumber));
        } else if (q.type === "MultipleChoices") {
          this.childElements.push(new MultipleChoicesQuestionElement(doc, exampleOptions, q, questionNumber));
        }
      });
    }

    if (section.questions.length > 0) {
      this.childElements.push(new HeadingElement(doc, options, "問題:"));
      section.questions.forEach((q, i) => {
        const questionNumber = `${i + 1}.`;
        if (q.type === "LongQuestion") {
          this.childElements.push(new LongQuestionElement(doc, options, q, questionNumber));
        } else if (q.type === "MultipleChoices") {
          this.childElements.push(new MultipleChoicesQuestionElement(doc, options, q, questionNumber));
        }
      });
    }
  }

  calculateRequiredHeight(): number {
    let totalHeight = 0;

    const descriptionElement = this.childElements[0];
    if (descriptionElement) {
      totalHeight += descriptionElement.calculateRequiredHeight();
    }

    const exampleHeadingIndex = this.childElements.findIndex(
      (el) => el instanceof HeadingElement && el.text === "例題:",
    );
    if (exampleHeadingIndex !== -1) {
      totalHeight += this.childElements[exampleHeadingIndex].calculateRequiredHeight();
      const questionsHeadingIndex = this.childElements.findIndex(
        (el) => el instanceof HeadingElement && el.text === "問題:",
      );
      const exampleElements = this.childElements.slice(
        exampleHeadingIndex + 1,
        questionsHeadingIndex !== -1 ? questionsHeadingIndex : this.childElements.length,
      );
      totalHeight += exampleElements.reduce((sum, el) => sum + el.calculateRequiredHeight(), 0);
    }

    const questionsHeadingIndex = this.childElements.findIndex(
      (el) => el instanceof HeadingElement && el.text === "問題:",
    );
    if (questionsHeadingIndex !== -1) {
      totalHeight += this.childElements[questionsHeadingIndex].calculateRequiredHeight();
      if (this.childElements[questionsHeadingIndex + 1]) {
        totalHeight += this.childElements[questionsHeadingIndex + 1].calculateRequiredHeight();
      }
    }

    return totalHeight;
  }

  render(y: number): number {
    y = this.addPageIfNeeded(y, this.calculateRequiredHeight());
    this.childElements.forEach((el) => {
      y = el.render(y);
    });

    return y + LINE_HEIGHT;
  }
}
