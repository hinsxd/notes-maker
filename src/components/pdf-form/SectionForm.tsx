"use client";

import { useState } from "react";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { questionSchema, sectionSchema } from "@/lib/pdf/validation";

import { QuestionForm } from "./QuestionForm";
import { Plus, X } from "lucide-react";
import { z } from "zod";

type SectionFormProps = {
  initialValues?: z.infer<typeof sectionSchema>;
  onSubmit: (values: z.infer<typeof sectionSchema>) => void;
  onCancel?: () => void;
  submitLabel?: string;
};

export function SectionForm({ initialValues, onSubmit, onCancel, submitLabel = "セクションを追加" }: SectionFormProps) {
  const [section, setSection] = useState<z.infer<typeof sectionSchema>>(
    initialValues || {
      type: "section",
      description: "",
      exampleQuestions: [],
      questions: [],
    },
  );
  const [showExampleForm, setShowExampleForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editingExampleIndex, setEditingExampleIndex] = useState<number | null>(null);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (section.description.trim()) {
      onSubmit(section);
    }
  };

  const renderQuestionItem = (question: z.infer<typeof questionSchema>, index: number, isExample: boolean) => (
    <Card key={index}>
      <CardContent className="pt-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium">{question.type === "LongQuestion" ? "長文回答" : "多肢選択"}</p>
              <p className="mt-1 text-sm text-gray-600">{question.questionText}</p>
              {question.type === "MultipleChoices" && (
                <div className="mt-2 space-y-1">
                  {question.choices.map((choice, i) => (
                    <p key={i} className="text-sm">
                      {i + 1}. {choice} {choice === question.answer && "✓"}
                    </p>
                  ))}
                </div>
              )}
              {question.type === "LongQuestion" && (
                <p className="mt-2 text-sm text-gray-500">答え: {question.answer}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (isExample) {
                    setEditingExampleIndex(index);
                    setShowExampleForm(true);
                  } else {
                    setEditingQuestionIndex(index);
                    setShowQuestionForm(true);
                  }
                }}>
                編集
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (isExample) {
                    setSection({
                      ...section,
                      exampleQuestions: section.exampleQuestions.filter((_, i) => i !== index),
                    });
                  } else {
                    setSection({
                      ...section,
                      questions: section.questions.filter((_, i) => i !== index),
                    });
                  }
                }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialValues ? "セクションを編集" : "新しいセクション"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <Label htmlFor="description">セクションの説明</Label>
              <Input
                id="description"
                value={section.description}
                onChange={(e) => setSection({ ...section, description: e.target.value })}
                placeholder="例: セクション1：長文回答問題"
                required
              />
            </div>

            <Tabs defaultValue="examples" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="examples">例題 ({section.exampleQuestions.length})</TabsTrigger>
                <TabsTrigger value="questions">問題 ({section.questions.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="examples" className="space-y-4">
                {section.exampleQuestions.length > 0 && (
                  <div className="space-y-2">
                    {section.exampleQuestions.map((q, i) => renderQuestionItem(q, i, true))}
                  </div>
                )}

                {showExampleForm ? (
                  <QuestionForm
                    isNested={true}
                    initialValues={
                      editingExampleIndex !== null ? section.exampleQuestions[editingExampleIndex] : undefined
                    }
                    onSubmit={(question) => {
                      if (editingExampleIndex !== null) {
                        const newQuestions = [...section.exampleQuestions];
                        newQuestions[editingExampleIndex] = question;
                        setSection({ ...section, exampleQuestions: newQuestions });
                      } else {
                        setSection({
                          ...section,
                          exampleQuestions: [...section.exampleQuestions, question],
                        });
                      }
                      setShowExampleForm(false);
                      setEditingExampleIndex(null);
                    }}
                    onCancel={() => {
                      setShowExampleForm(false);
                      setEditingExampleIndex(null);
                    }}
                    submitLabel={editingExampleIndex !== null ? "更新" : "例題を追加"}
                  />
                ) : (
                  <Button type="button" variant="outline" onClick={() => setShowExampleForm(true)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    例題を追加
                  </Button>
                )}
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                {section.questions.length > 0 && (
                  <div className="space-y-2">{section.questions.map((q, i) => renderQuestionItem(q, i, false))}</div>
                )}

                {showQuestionForm ? (
                  <QuestionForm
                    isNested={true}
                    initialValues={editingQuestionIndex !== null ? section.questions[editingQuestionIndex] : undefined}
                    onSubmit={(question) => {
                      if (editingQuestionIndex !== null) {
                        const newQuestions = [...section.questions];
                        newQuestions[editingQuestionIndex] = question;
                        setSection({ ...section, questions: newQuestions });
                      } else {
                        setSection({
                          ...section,
                          questions: [...section.questions, question],
                        });
                      }
                      setShowQuestionForm(false);
                      setEditingQuestionIndex(null);
                    }}
                    onCancel={() => {
                      setShowQuestionForm(false);
                      setEditingQuestionIndex(null);
                    }}
                    submitLabel={editingQuestionIndex !== null ? "更新" : "問題を追加"}
                  />
                ) : (
                  <Button type="button" variant="outline" onClick={() => setShowQuestionForm(true)} className="w-full">
                    <Plus className="mr-2 h-4 w-4" />
                    問題を追加
                  </Button>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  キャンセル
                </Button>
              )}
              <Button type="submit" disabled={!section.description.trim()}>
                {submitLabel}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
