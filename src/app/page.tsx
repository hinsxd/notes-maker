"use client";

import {
  DocumentItem,
  Section,
  generateDummyLongQuestions,
  generateDummyMultipleChoicesQuestions,
  generatePdf,
} from "../lib/pdf";

const Page = () => {
  const handleGenerateMixedVersion = (isAnswerMode: boolean) => {
    console.log("here2");
    const longQuestions = generateDummyLongQuestions(11);
    const mcQuestions = generateDummyMultipleChoicesQuestions(8);

    const section1: Section = {
      type: "section",
      description: "セクション1：長文回答問題",
      exampleQuestions: generateDummyLongQuestions(2),
      questions: longQuestions,
    };

    const section2: Section = {
      type: "section",
      description: "セクション2：多肢選択問題",
      exampleQuestions: [generateDummyMultipleChoicesQuestions(1)[0]],
      questions: mcQuestions,
    };

    const standaloneQuestion = generateDummyLongQuestions(1)[0];

    const allItems: DocumentItem[] = [section1, section2, standaloneQuestion];
    generatePdf(allItems, { isAnswerMode });
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">PDF生成デモ</h1>
      <div className="space-x-4">
        <button
          onClick={() => handleGenerateMixedVersion(false)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
          生徒用バージョンを生成（セクション）
        </button>
        <button
          onClick={() => handleGenerateMixedVersion(true)}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600">
          教師用バージョンを生成（セクション）
        </button>
      </div>
    </div>
  );
};

export default Page;
