"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FILL_PLACEHOLDER, questionSchema, sectionSchema } from "@/lib/pdf/validation";

import { QuestionForm } from "./QuestionForm";
import { Edit, FileText, Plus, Save } from "lucide-react";
import { z } from "zod";

type SectionFormProps = {
  initialValues?: z.infer<typeof sectionSchema>;
  onSubmit: (values: z.infer<typeof sectionSchema>) => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
};

export function SectionForm({ initialValues, onSubmit, onDelete, showDeleteButton = false }: SectionFormProps) {
  const [isEditing, setIsEditing] = useState(!initialValues); // New section starts in edit mode
  const [section, setSection] = useState<z.infer<typeof sectionSchema>>(
    initialValues || {
      type: "section",
      description: "",
      exampleQuestions: [],
      questions: [],
    },
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (section.description.trim()) {
      onSubmit(section);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (initialValues) {
      setSection(initialValues);
      setIsEditing(false);
    } else {
      // For new sections, call onDelete to remove from parent
      onDelete?.();
    }
  };

  const addQuestion = (
    questionType: "LongQuestion" | "MultipleChoices" | "Fill",
    target: "exampleQuestions" | "questions",
  ) => {
    let newQuestion;
    switch (questionType) {
      case "LongQuestion":
        newQuestion = { type: "LongQuestion" as const, questionText: "", answer: "" };
        break;
      case "Fill":
        newQuestion = {
          type: "Fill" as const,
          questionText: `日本の首都は${FILL_PLACEHOLDER}です。`,
          answer: "東京",
        };
        break;
      case "MultipleChoices":
        newQuestion = { type: "MultipleChoices" as const, questionText: "", choices: ["", ""], answer: "" };
        break;
    }

    setSection((prevSection) => ({
      ...prevSection,
      [target]: [...prevSection[target], newQuestion],
    }));
  };

  const updateExampleQuestion = (index: number, question: z.infer<typeof questionSchema>) => {
    const newQuestions = [...section.exampleQuestions];
    newQuestions[index] = question;
    setSection({ ...section, exampleQuestions: newQuestions });
  };

  const deleteExampleQuestion = (index: number) => {
    const newQuestions = section.exampleQuestions.filter((_, i) => i !== index);
    setSection({ ...section, exampleQuestions: newQuestions });
  };

  const updateRegularQuestion = (index: number, question: z.infer<typeof questionSchema>) => {
    const newQuestions = [...section.questions];
    newQuestions[index] = question;
    setSection({ ...section, questions: newQuestions });
  };

  const deleteRegularQuestion = (index: number) => {
    const newQuestions = section.questions.filter((_, i) => i !== index);
    setSection({ ...section, questions: newQuestions });
  };

  // Read-only view
  if (!isEditing && initialValues) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span className="font-medium">セクション: {initialValues.description}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>例題: {initialValues.exampleQuestions.length}</span>
                <span>問題: {initialValues.questions.length}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit className="mr-1 h-3 w-3" />
                    編集
                  </Button>
                  {showDeleteButton && onDelete && (
                    <Button variant="destructive" size="sm" onClick={onDelete}>
                      削除
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Preview of questions */}
            <div className="space-y-4 pl-4">
              {initialValues.exampleQuestions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">例題:</h4>
                  <div className="space-y-2">
                    {initialValues.exampleQuestions.map((q, i) => (
                      <div key={i} className="text-sm text-gray-600">
                        <span className="font-medium">{i + 1}.</span> {q.questionText}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {initialValues.questions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-medium">問題:</h4>
                  <div className="space-y-2">
                    {initialValues.questions.map((q, i) => (
                      <div key={i} className="text-sm text-gray-600">
                        <span className="font-medium">{i + 1}.</span> {q.questionText}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Edit mode
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
                {section.exampleQuestions.map((question, index) => (
                  <QuestionForm
                    key={index}
                    initialValues={question}
                    onSubmit={(updatedQuestion) => updateExampleQuestion(index, updatedQuestion)}
                    onDelete={() => deleteExampleQuestion(index)}
                    isNested={true}
                    showDeleteButton={true}
                  />
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      例題を追加
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addQuestion("LongQuestion", "exampleQuestions")}>
                      長文問題
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addQuestion("Fill", "exampleQuestions")}>
                      穴埋め問題
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addQuestion("MultipleChoices", "exampleQuestions")}>
                      多肢選択問題
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsContent>

              <TabsContent value="questions" className="space-y-4">
                {section.questions.map((question, index) => (
                  <QuestionForm
                    key={index}
                    initialValues={question}
                    onSubmit={(updatedQuestion) => updateRegularQuestion(index, updatedQuestion)}
                    onDelete={() => deleteRegularQuestion(index)}
                    isNested={true}
                    showDeleteButton={true}
                  />
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      問題を追加
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => addQuestion("LongQuestion", "questions")}>
                      長文問題
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addQuestion("Fill", "questions")}>穴埋め問題</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addQuestion("MultipleChoices", "questions")}>
                      多肢選択問題
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={handleCancel}>
                キャンセル
              </Button>
              <Button type="submit" disabled={!section.description.trim()}>
                <Save className="mr-1 h-3 w-3" />
                {initialValues ? "更新" : "セクションを保存"}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
