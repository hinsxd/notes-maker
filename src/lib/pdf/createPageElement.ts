import { DocumentItem } from "@/lib/pdf/validation";

import { FillQuestionElement } from "./elements/FillQuestionElement";
import { LongQuestionElement } from "./elements/LongQuestionElement";
import { MultipleChoicesQuestionElement } from "./elements/MultipleChoicesQuestionElement";
import { SectionElement } from "./elements/SectionElement";
import { GeneratePdfOptions, PageElement } from "./types";
import { jsPDF } from "jspdf";

export function createPageElement(doc: jsPDF, options: GeneratePdfOptions, item: DocumentItem): PageElement {
  switch (item.type) {
    case "Fill":
      return new FillQuestionElement(doc, options, item);
    case "LongQuestion":
      return new LongQuestionElement(doc, options, item);
    case "MultipleChoices":
      return new MultipleChoicesQuestionElement(doc, options, item);
    case "section":
      return new SectionElement(doc, options, item);
    default:
      throw new Error("Unknown document item type");
  }
}
