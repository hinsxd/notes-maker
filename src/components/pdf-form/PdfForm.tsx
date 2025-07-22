"use client";

import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PdfFormData, documentItemSchema, pdfFormSchema } from "@/lib/pdf/validation";
import { useForm, useStore } from "@tanstack/react-form";
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

const initialState = JSON.stringify({
  isAnswerMode: false,
  items: [],
  title: "",
});

function getCurrentState() {
  if (typeof window === "undefined") {
    return {
      isAnswerMode: false,
      items: [],
      title: "",
    } as PdfFormData;
  }
  const localState = localStorage.getItem("pdfFormState");

  if (!localState) {
    return {
      isAnswerMode: false,
      items: [],
      title: "",
    } as PdfFormData;
  }

  return JSON.parse(localState) as PdfFormData;
}

export function PdfForm() {
  const form = useForm({
    defaultValues: getCurrentState(),
    validators: { onChange: pdfFormSchema },

    onSubmit: ({ value }) => {
      mutation.mutate(value);
    },
  });

  const allValues = useStore(form.store, (state) => state.values);

  useEffect(() => {
    if (JSON.stringify(allValues) !== initialState) {
      localStorage.setItem("pdfFormState", JSON.stringify(allValues));
    }
  }, [JSON.stringify(allValues)]);

  const isFormValid = form.state.isValid;

  const mutation = useMutation({
    mutationFn: generatePdf,
    onSuccess: (blob, { isAnswerMode, title }) => {
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

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PDF生成フォーム</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <form.Field name="title" mode="value">
              {(field) => (
                <div className="space-y-2">
                  <Label htmlFor={field.name}>ドキュメントタイトル</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="例：第1回小テスト、練習問題 など"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="isAnswerMode">
              {(field) => (
                <div className="flex items-center space-x-2">
                  <Switch id="answer-mode" checked={field.state.value} onCheckedChange={field.handleChange} />
                  <Label htmlFor="answer-mode">教師用バージョン（答えを表示）</Label>
                </div>
              )}
            </form.Field>

            <form.Field name="items" mode="array">
              {(field) => {
                const items = field.state.value;
                const updateItem = (index: number, item: DocumentItem) => {
                  const newItems = [...items];
                  newItems[index] = item;
                  field.handleChange(newItems);
                };

                const deleteItem = (index: number) => {
                  field.handleChange(items.filter((_, i) => i !== index));
                };

                const addSection = () => {
                  field.handleChange([
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
                  field.handleChange([
                    ...items,
                    {
                      type: "LongQuestion",
                      questionText: "",
                      answer: "",
                    },
                  ]);
                };

                const addFillQuestion = () => {
                  field.handleChange([
                    ...items,
                    {
                      type: "Fill",
                      questionText: "",
                      answer: "",
                    },
                  ]);
                };

                const addMultipleChoicesQuestion = () => {
                  field.handleChange([
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
                  <>
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
                  </>
                );
              }}
            </form.Field>

            <form.Subscribe selector={(state) => state.canSubmit}>
              {(canSubmit) => {
                return (
                  <div className="flex justify-end border-t pt-4">
                    <Button onClick={form.handleSubmit} disabled={!canSubmit || mutation.isPending} size="lg">
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
                );
              }}
            </form.Subscribe>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
