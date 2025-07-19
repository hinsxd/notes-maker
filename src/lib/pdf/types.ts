import { jsPDF } from "jspdf";

// -----------------
// Core Types
// -----------------

export type LongQuestion = {
  type: "longQuestion";
  questionText: string;
  answer: string;
};

export type MultipleChoicesQuestion = {
  type: "MultipleChoices";
  questionText: string;
  choices: string[];
  answer: string;
};

export type Question = LongQuestion | MultipleChoicesQuestion;

export type Section = {
  type: "section";
  description: string;
  exampleQuestions: Question[];
  questions: Question[];
};

export type DocumentItem = Question | Section;

export type GeneratePdfOptions = {
  isAnswerMode: boolean;
};

// -----------------
// Constants
// -----------------

export const FONT_SIZE = 12;
export const LINE_HEIGHT = 7;
export const PAGE_MARGIN = 20;

// -----------------
// Base Class
// -----------------

export abstract class PageElement {
  protected doc: jsPDF;
  protected options: GeneratePdfOptions;
  protected pageWidth: number;

  constructor(doc: jsPDF, options: GeneratePdfOptions) {
    this.doc = doc;
    this.options = options;
    this.pageWidth = doc.internal.pageSize.getWidth();
  }

  abstract calculateRequiredHeight(): number;
  abstract render(y: number): number; // returns new y
  abstract getElements(): PageElement[];
}
