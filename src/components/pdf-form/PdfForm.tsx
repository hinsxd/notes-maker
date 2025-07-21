"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { documentItemSchema, pdfFormSchema } from "@/lib/pdf/validation";
import { useMutation } from "@tanstack/react-query";

import { AddItemDropdown } from "./AddItemDropdown";
import { QuestionForm } from "./QuestionForm";
import { SectionForm } from "./SectionForm";
import { Download, Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

type DocumentItem = z.infer<typeof documentItemSchema>;

async function generatePdf(data: z.infer<typeof pdfFormSchema>) {
  const response = await fetch("/api/generate-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("PDF generation failed");
  }

  return response.blob();
}

export function PdfForm() {
  const [items, setItems] = useState<DocumentItem[]>([]);
  const [isAnswerMode, setIsAnswerMode] = useState(false);

  const mutation = useMutation({
    mutationFn: generatePdf,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `generated-${isAnswerMode ? "answer" : "student"}-${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("PDFが正常に生成されました！");
    },
    onError: (error) => {
      console.error(error);
      toast.error("PDFの生成に失敗しました。");
    },
  });

  const handleSubmit = () => {
    if (items.length === 0) {
      toast.error("最低1つの項目を追加してください。");

      return;
    }

    mutation.mutate({ items, isAnswerMode });
  };

  const updateItem = (index: number, item: DocumentItem) => {
    const newItems = [...items];
    newItems[index] = item;
    setItems(newItems);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addSection = () => {
    setItems([
      ...items,
      {
        type: "section",
        description: "",
        exampleQuestions: [],
        questions: [],
      },
    ]);
  };

  const addStandaloneQuestion = () => {
    setItems([
      ...items,
      {
        type: "LongQuestion",
        questionText: "",
        answer: "",
      },
    ]);
  };

  const addFillQuestion = () => {
    setItems([
      ...items,
      {
        type: "Fill",
        questionText: "",
        answer: "",
      },
    ]);
  };

  const addMultipleChoicesQuestion = () => {
    setItems([
      ...items,
      {
        type: "MultipleChoices",
        questionText: "",
        choices: [],
        answer: "",
      },
    ]);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF生成フォーム</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center space-x-2">
              <Switch id="answer-mode" checked={isAnswerMode} onCheckedChange={setIsAnswerMode} />
              <Label htmlFor="answer-mode">教師用バージョン（答えを表示）</Label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">項目一覧 ({items.length})</h3>
                {/* Add section */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addSection}>
                    <Plus className="mr-1 h-3 w-3" />
                    セクション追加
                  </Button>
                  <AddItemDropdown
                    onAddLongQuestion={addStandaloneQuestion}
                    onAddFillQuestion={addFillQuestion}
                    onAddMultipleChoicesQuestion={addMultipleChoicesQuestion}
                  ></AddItemDropdown>
                </div>
              </div>

              {items.length > 0 ? (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index}>
                      {item.type === "section" ? (
                        <SectionForm
                          initialValues={item}
                          onSubmit={(updatedItem) => updateItem(index, updatedItem)}
                          onDelete={() => deleteItem(index)}
                          showDeleteButton={true}
                        />
                      ) : (
                        <QuestionForm
                          initialValues={item}
                          onSubmit={(updatedItem) => updateItem(index, updatedItem)}
                          onDelete={() => deleteItem(index)}
                          showDeleteButton={true}
                        />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border-2 border-dashed border-gray-300 py-8 text-center text-gray-500">
                  <p className="mb-4">まだ項目がありません</p>
                  <div className="flex justify-center gap-2">
                    <Button variant="outline" size="sm" onClick={addSection}>
                      <Plus className="mr-1 h-3 w-3" />
                      セクション追加
                    </Button>
                    <AddItemDropdown
                      onAddLongQuestion={addStandaloneQuestion}
                      onAddFillQuestion={addFillQuestion}
                      onAddMultipleChoicesQuestion={addMultipleChoicesQuestion}
                    ></AddItemDropdown>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button onClick={handleSubmit} disabled={items.length === 0 || mutation.isPending} size="lg">
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    PDFを生成
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
