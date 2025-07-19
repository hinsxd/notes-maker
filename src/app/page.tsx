"use client";

import { PdfForm } from "@/components/pdf-form/PdfForm";
import { Toaster } from "@/components/ui/sonner";

export default function Page() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-center text-3xl font-bold">教育用PDF生成ツール</h1>
      <PdfForm />
      <Toaster />
    </div>
  );
}
