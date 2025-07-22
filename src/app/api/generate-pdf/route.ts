import { NextRequest, NextResponse } from "next/server";

import { generatePdf } from "@/lib/pdf";
import { pdfFormSchema } from "@/lib/pdf/validation";

import { z } from "zod";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate the request body
    const validatedData = pdfFormSchema.parse(body);

    // Generate PDF with the provided items
    const pdfBytes = generatePdf(validatedData, {
      isAnswerMode: validatedData.isAnswerMode,
    });

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=output.pdf",
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid request data", details: error.issues }, { status: 400 });
    }

    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
