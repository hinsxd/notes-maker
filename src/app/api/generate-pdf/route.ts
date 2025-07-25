import { NextRequest, NextResponse } from "next/server";

import { generatePdf } from "@/lib/pdf";
import * as PdfTypes from "@/lib/pdf/validation";
import * as PayloadTypes from "@/payload-types";
import config from "@/payload.config";

import { getPayload } from "payload";

const transformToPdfFormData = (exercise: PayloadTypes.Exercise, isAnswerMode: boolean): PdfTypes.PdfFormData => {
  const transformItems = (items: PayloadTypes.Exercise["items"] | undefined): PdfTypes.DocumentItem[] => {
    if (!items) return [];

    return items.map((item) => {
      if (item.blockType === "section") {
        return {
          type: "section",
          description: item.description,
          exampleQuestions: transformItems(item.exampleQuestions),
          questions: transformItems(item.questions),
        } as PdfTypes.Section;
      }

      if (item.blockType === "LongQuestion") {
        return {
          type: "LongQuestion",
          questionText: item.questionText,
          answer: item.answer,
        } as PdfTypes.LongQuestion;
      }

      if (item.blockType === "Fill") {
        return {
          type: "Fill",
          questionText: item.questionText,
          answer: item.answer,
        } as PdfTypes.FillQuestion;
      }

      if (item.blockType === "MultipleChoices") {
        return {
          type: "MultipleChoices",
          questionText: item.questionText,
          choices: item.choices.map((choice) => choice.choice),
          answer: item.answer,
        } as PdfTypes.MultipleChoicesQuestion;
      }

      throw new Error(`Unknown block type`);
    });
  };

  return {
    title: exercise.title,
    items: transformItems(exercise.items),
    isAnswerMode,
  };
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const isAnswerMode = searchParams.get("isAnswerMode") === "true";

  if (!id) {
    return NextResponse.json({ error: "Missing exercise ID" }, { status: 400 });
  }

  try {
    const payload = await getPayload({ config });
    const exercise = await payload.findByID({
      collection: "exercises",
      id,
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercise not found" }, { status: 404 });
    }

    const pdfData = transformToPdfFormData(exercise, isAnswerMode);

    const validationResult = PdfTypes.pdfFormSchema.safeParse(pdfData);

    if (!validationResult.success) {
      console.error("PDF data validation error:", validationResult.error.issues);

      return NextResponse.json({ error: validationResult.error.message }, { status: 400 });
    }

    const pdf = generatePdf(validationResult.data, { isAnswerMode });

    return new NextResponse(pdf, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${exercise.title}.pdf"`,
      },
    });
  } catch (error) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
