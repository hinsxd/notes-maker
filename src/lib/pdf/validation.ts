import { z } from "zod";

// Question schemas
export const longQuestionSchema = z.object({
  type: z.literal("LongQuestion"),
  questionText: z.string().min(1, "質問文は必須です"),
  answer: z.string().min(1, "答えは必須です"),
});

export const multipleChoicesQuestionSchema = z.object({
  type: z.literal("MultipleChoices"),
  questionText: z.string().min(1, "質問文は必須です"),
  choices: z.array(z.string().min(1, "選択肢は空にできません")).min(2, "最低2つの選択肢が必要です"),
  answer: z.string().min(1, "正解は必須です"),
});

export const questionSchema = z.discriminatedUnion("type", [longQuestionSchema, multipleChoicesQuestionSchema]);

// Section schema
export const sectionSchema = z.object({
  type: z.literal("section"),
  description: z.string().min(1, "セクションの説明は必須です"),
  exampleQuestions: z.array(questionSchema),
  questions: z.array(questionSchema),
});

// Document item schema
export const documentItemSchema = z.discriminatedUnion("type", [questionSchema, sectionSchema]);

// Form schema
export const pdfFormSchema = z.object({
  items: z.array(documentItemSchema).min(1, "最低1つの項目が必要です"),
  isAnswerMode: z.boolean(),
});

export type PdfFormData = z.infer<typeof pdfFormSchema>;
