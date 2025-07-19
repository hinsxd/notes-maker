"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { longQuestionSchema, multipleChoicesQuestionSchema, questionSchema } from "@/lib/pdf/validation";
import { useForm, useStore } from "@tanstack/react-form";

import { Edit, Plus, Save, X } from "lucide-react";
import { z } from "zod";

type QuestionFormProps = {
  initialValues?: z.infer<typeof questionSchema>;
  onSubmit: (values: z.infer<typeof questionSchema>) => void;
  onDelete?: () => void;
  isNested?: boolean;
  showDeleteButton?: boolean;
};

// Helper function to create initial values for each question type
const createInitialValues = (type: "LongQuestion" | "MultipleChoices") => {
  if (type === "LongQuestion") {
    return {
      type: "LongQuestion" as const,
      questionText: "",
      answer: "",
    };
  } else {
    return {
      type: "MultipleChoices" as const,
      questionText: "",
      choices: [],
      answer: "",
    };
  }
};

export function QuestionForm({
  initialValues,
  onSubmit,
  onDelete,
  isNested = false,
  showDeleteButton = false,
}: QuestionFormProps) {
  const [isEditing, setIsEditing] = useState(!initialValues); // New question starts in edit mode

  const form = useForm({
    defaultValues: initialValues || createInitialValues("LongQuestion"),
    onSubmit: async ({ value }) => {
      onSubmit(value);
      setIsEditing(false);
    },
  });

  // Use useStore for reactivity as per TanStack Form guide
  const questionType = useStore(form.store, (state) => state.values.type);
  const choices = useStore(form.store, (state) =>
    state.values.type === "MultipleChoices" ? state.values.choices : [],
  );

  // Reset form when question type changes
  useEffect(() => {
    if (!initialValues && isEditing) {
      // Only reset if not editing an existing question
      const currentType = form.state.values.type;
      const newInitialValues = createInitialValues(currentType);

      // Only reset if the structure doesn't match
      const currentValues = form.state.values;
      const shouldReset =
        (currentType === "LongQuestion" && "choices" in currentValues) ||
        (currentType === "MultipleChoices" && !("choices" in currentValues));

      if (shouldReset) {
        form.reset(newInitialValues);
      }
    }
  }, [questionType, form, initialValues, isEditing]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    form.handleSubmit();
  };

  const handleCancel = () => {
    if (initialValues) {
      form.reset(initialValues);
      setIsEditing(false);
    } else {
      // For new questions, call onDelete to remove from parent
      onDelete?.();
    }
  };

  // Read-only view
  if (!isEditing && initialValues) {
    return (
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="font-medium">{initialValues.type === "LongQuestion" ? "長文回答" : "多肢選択"}</p>
                <p className="mt-1 text-sm text-gray-600">{initialValues.questionText}</p>
                {initialValues.type === "MultipleChoices" && (
                  <div className="mt-2 space-y-1">
                    {initialValues.choices.map((choice, i) => (
                      <p key={i} className="text-sm">
                        {i + 1}. {choice} {choice === initialValues.answer && "✓"}
                      </p>
                    ))}
                  </div>
                )}
                {initialValues.type === "LongQuestion" && (
                  <p className="mt-2 text-sm text-gray-500">答え: {initialValues.answer}</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="mr-1 h-3 w-3" />
                  編集
                </Button>
                {showDeleteButton && onDelete && (
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Edit mode form
  const formContent = (
    <div className="space-y-4">
      <form.Field name="type">
        {(field) => (
          <div className="space-y-2">
            <Label>質問タイプ</Label>
            <RadioGroup
              value={field.state.value}
              onValueChange={(value) => {
                if (value === "LongQuestion" || value === "MultipleChoices") {
                  if (value !== "LongQuestion") form.setFieldValue("choices", []);
                  field.handleChange(value);
                }
              }}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="LongQuestion" id="LongQuestion" />
                <Label htmlFor="LongQuestion">長文回答</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MultipleChoices" id="MultipleChoices" />
                <Label htmlFor="MultipleChoices">多肢選択</Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </form.Field>

      <form.Field
        name="questionText"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "質問文は必須です";

            return undefined;
          },
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>質問文</Label>
            <Textarea
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="質問を入力してください"
              rows={3}
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
              <p className="text-sm text-red-600">{field.state.meta.errors.join(", ")}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      {questionType === "MultipleChoices" && (
        <form.Field
          name="choices"
          validators={{
            onChange: ({ value }) => {
              if (!Array.isArray(value)) return "選択肢が正しくありません";
              const choicesArray = value;
              if (choicesArray.length < 2) return "最低2つの選択肢が必要です";
              if (choicesArray.some((c) => !c.trim())) return "選択肢は空にできません";

              return undefined;
            },
          }}>
          {(field) => {
            const fieldChoices = Array.isArray(field.state.value) ? field.state.value : ["", ""];

            return (
              <div className="space-y-2">
                <Label>選択肢</Label>
                {fieldChoices.map((choice, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={choice}
                      onChange={(e) => {
                        const newChoices = [...fieldChoices];
                        newChoices[index] = e.target.value;
                        field.handleChange(newChoices);
                      }}
                      placeholder={`選択肢 ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newChoices = fieldChoices.filter((_, i) => i !== index);
                        field.handleChange(newChoices);
                      }}
                      disabled={fieldChoices.length <= 2}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    field.handleChange([...fieldChoices, ""]);
                  }}>
                  <Plus className="mr-2 h-4 w-4" />
                  選択肢を追加
                </Button>
                {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
                  <p className="text-sm text-red-600">{field.state.meta.errors.join(", ")}</p>
                ) : null}
              </div>
            );
          }}
        </form.Field>
      )}

      <form.Field
        name="answer"
        validators={{
          onChange: ({ value }) => {
            if (!value) return "答えは必須です";

            return undefined;
          },
        }}>
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name}>{questionType === "MultipleChoices" ? "正解" : "答え"}</Label>
            {questionType === "MultipleChoices" ? (
              <RadioGroup value={field.state.value} onValueChange={field.handleChange}>
                {choices.map((choice, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={choice} id={`answer-${index}`} disabled={!choice.trim()} />
                    <Label htmlFor={`answer-${index}`}>{choice || `選択肢 ${index + 1}`}</Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="答えを入力してください"
                rows={2}
              />
            )}
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
              <p className="text-sm text-red-600">{field.state.meta.errors.join(", ")}</p>
            ) : null}
          </div>
        )}
      </form.Field>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={handleCancel}>
          キャンセル
        </Button>
        <form.Subscribe selector={(state) => state.canSubmit}>
          {(canSubmit) => (
            <Button
              type={isNested ? "button" : "submit"}
              disabled={!canSubmit}
              onClick={isNested ? () => form.handleSubmit() : undefined}>
              <Save className="mr-1 h-3 w-3" />
              {form.state.isSubmitting ? "保存中..." : "保存"}
            </Button>
          )}
        </form.Subscribe>
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="pt-6">
        {isNested ? formContent : <form onSubmit={handleFormSubmit}>{formContent}</form>}
      </CardContent>
    </Card>
  );
}
