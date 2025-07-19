import { createPageElement } from "../createPageElement";
import { GeneratePdfOptions, PageElement, Section } from "../types";
import { HeadingElement } from "./HeadingElement";
import { jsPDF } from "jspdf";

export class SectionElement extends PageElement {
  private section: Section;
  private childElements: PageElement[] = [];

  constructor(doc: jsPDF, options: GeneratePdfOptions, section: Section) {
    console.log("[SectionElement]");
    super(doc, options);
    this.section = section;
    const exampleOptions = { ...options, isAnswerMode: true };

    this.childElements.push(new HeadingElement(doc, options, section.description));

    if (section.exampleQuestions.length > 0) {
      this.childElements.push(new HeadingElement(doc, options, "Examples:"));
      section.exampleQuestions.forEach((q) => {
        this.childElements.push(createPageElement(doc, exampleOptions, q));
      });
    }

    if (section.questions.length > 0) {
      this.childElements.push(new HeadingElement(doc, options, "Questions:"));
      section.questions.forEach((q) => {
        this.childElements.push(createPageElement(doc, options, q));
      });
    }
  }

  calculateRequiredHeight(): number {
    let totalHeight = 0;
    console.log("[SectionElement] calculateRequiredHeight", this.childElements);

    // Description height
    const descriptionElement = this.childElements[0];
    if (descriptionElement) {
      totalHeight += descriptionElement.calculateRequiredHeight();
    }

    // Example questions height
    const exampleHeadingIndex = this.childElements.findIndex(
      (el) => el instanceof HeadingElement && el.text === "Examples:",
    );
    if (exampleHeadingIndex !== -1) {
      totalHeight += this.childElements[exampleHeadingIndex].calculateRequiredHeight();
      const questionsHeadingIndex = this.childElements.findIndex(
        (el) => el instanceof HeadingElement && el.text === "Questions:",
      );
      const exampleElements = this.childElements.slice(
        exampleHeadingIndex + 1,
        questionsHeadingIndex !== -1 ? questionsHeadingIndex : this.childElements.length,
      );
      totalHeight += exampleElements.reduce((sum, el) => sum + el.calculateRequiredHeight(), 0);
    }

    // First question height
    const questionsHeadingIndex = this.childElements.findIndex(
      (el) => el instanceof HeadingElement && el.text === "Questions:",
    );
    if (questionsHeadingIndex !== -1) {
      totalHeight += this.childElements[questionsHeadingIndex].calculateRequiredHeight();
      console.log("[SectionElement] questionsHeadingIndex", questionsHeadingIndex);
      if (this.childElements[questionsHeadingIndex + 1]) {
        console.log("[SectionElement] questionsHeadingIndex + 1", questionsHeadingIndex + 1);
        totalHeight += this.childElements[questionsHeadingIndex + 1].calculateRequiredHeight();
      }
    }

    return totalHeight;
  }

  render(y: number): number {
    return y; // Container
  }

  getElements(): PageElement[] {
    return [this, ...this.childElements];
  }
}
