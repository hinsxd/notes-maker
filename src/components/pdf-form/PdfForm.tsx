"use client";

import { useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { documentItemSchema, pdfFormSchema } from "@/lib/pdf/validation";
import { useMutation } from "@tanstack/react-query";

import { QuestionForm } from "./QuestionForm";
import { SectionForm } from "./SectionForm";
import { Download, FileText, Loader2, Plus, X } from "lucide-react";
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
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

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

  const renderItem = (item: DocumentItem, index: number) => {
    if (item.type === "section") {
      return (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">セクション: {item.description}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>例題: {item.exampleQuestions.length}</span>
                <span>問題: {item.questions.length}</span>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              {item.exampleQuestions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">例題:</h4>
                  <div className="space-y-2 pl-4">
                    {item.exampleQuestions.map((q, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{i + 1}.</span> {q.questionText}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {item.questions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">問題:</h4>
                  <div className="space-y-2 pl-4">
                    {item.questions.map((q, i) => (
                      <div key={i} className="text-sm">
                        <span className="font-medium">{i + 1}.</span> {q.questionText}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingIndex(index);
                    setShowSectionForm(true);
                  }}>
                  編集
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setItems(items.filter((_, i) => i !== index))}>
                  削除
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      );
    } else {
      return (
        <Card key={index}>
          <CardContent className="pt-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">単独問題 ({item.type === "LongQuestion" ? "長文回答" : "多肢選択"})</p>
                <p className="mt-1 text-sm text-gray-600">{item.questionText}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setEditingIndex(index);
                    setShowQuestionForm(true);
                  }}>
                  編集
                </Button>
                <Button variant="destructive" size="sm" onClick={() => setItems(items.filter((_, i) => i !== index))}>
                  削除
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }
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

            <Tabs defaultValue="items" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="items">項目一覧 ({items.length})</TabsTrigger>
                <TabsTrigger value="add">新規追加</TabsTrigger>
              </TabsList>

              <TabsContent value="items" className="space-y-4">
                {items.length > 0 ? (
                  <Accordion type="single" collapsible className="w-full">
                    {items.map((item, index) => renderItem(item, index))}
                  </Accordion>
                ) : (
                  <div className="py-8 text-center text-gray-500">
                    まだ項目がありません。「新規追加」タブから追加してください。
                  </div>
                )}
              </TabsContent>

              <TabsContent value="add" className="space-y-4">
                {showSectionForm ? (
                  <SectionForm
                    initialValues={
                      editingIndex !== null && items[editingIndex]?.type === "section" ? items[editingIndex] : undefined
                    }
                    onSubmit={(section) => {
                      if (editingIndex !== null) {
                        const newItems = [...items];
                        newItems[editingIndex] = section;
                        setItems(newItems);
                      } else {
                        setItems([...items, section]);
                      }
                      setShowSectionForm(false);
                      setEditingIndex(null);
                      toast.success("セクションが追加されました");
                    }}
                    onCancel={() => {
                      setShowSectionForm(false);
                      setEditingIndex(null);
                    }}
                    submitLabel={editingIndex !== null ? "更新" : "追加"}
                  />
                ) : showQuestionForm ? (
                  <QuestionForm
                    initialValues={
                      editingIndex !== null && items[editingIndex]?.type !== "section" ? items[editingIndex] : undefined
                    }
                    onSubmit={(question) => {
                      if (editingIndex !== null) {
                        const newItems = [...items];
                        newItems[editingIndex] = question;
                        setItems(newItems);
                      } else {
                        setItems([...items, question]);
                      }
                      setShowQuestionForm(false);
                      setEditingIndex(null);
                      toast.success("問題が追加されました");
                    }}
                    onCancel={() => {
                      setShowQuestionForm(false);
                      setEditingIndex(null);
                    }}
                    submitLabel={editingIndex !== null ? "更新" : "追加"}
                  />
                ) : (
                  <div className="space-y-4">
                    <Button variant="outline" onClick={() => setShowSectionForm(true)} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      セクションを追加
                    </Button>
                    <Button variant="outline" onClick={() => setShowQuestionForm(true)} className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      単独問題を追加
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end">
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
