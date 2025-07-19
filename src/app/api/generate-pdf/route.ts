import { NextRequest, NextResponse } from "next/server";

import {
  DocumentItem,
  Section,
  generateDummyLongQuestions,
  generateDummyMultipleChoicesQuestions,
  generatePdf,
} from "../../../lib/pdf";

export async function POST(req: NextRequest) {
  const { isAnswerMode } = await req.json();

  console.log("here2");
  const longQuestions = generateDummyLongQuestions(11);
  const mcQuestions = generateDummyMultipleChoicesQuestions(8);

  const section1: Section = {
    type: "section",
    description: "セクション1：長文回答問題",
    exampleQuestions: generateDummyLongQuestions(2),
    questions: longQuestions,
  };

  const section2: Section = {
    type: "section",
    description: "セクション2：多肢選択問題",
    exampleQuestions: [generateDummyMultipleChoicesQuestions(1)[0]],
    questions: mcQuestions,
  };

  const standaloneQuestion = generateDummyLongQuestions(1)[0];

  const allItems: DocumentItem[] = [section1, section2, standaloneQuestion];
  const pdfBytes = generatePdf(allItems, { isAnswerMode });

  return new NextResponse(pdfBytes, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=output.pdf",
    },
  });
}
