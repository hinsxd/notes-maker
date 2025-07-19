import { LongQuestionElement } from "./elements/LongQuestionElement";
import { MultipleChoicesQuestionElement } from "./elements/MultipleChoicesQuestionElement";
import { SectionElement } from "./elements/SectionElement";
import { DocumentItem, GeneratePdfOptions, PageElement } from "./types";
import { jsPDF } from "jspdf";

export function createPageElement(doc: jsPDF, options: GeneratePdfOptions, item: DocumentItem): PageElement {
  switch (item.type) {
    case "longQuestion":
      return new LongQuestionElement(doc, options, item);
    case "MultipleChoices":
      return new MultipleChoicesQuestionElement(doc, options, item);
    case "section":
      return new SectionElement(doc, options, item);
    default:
      throw new Error("Unknown document item type");
  }
}
