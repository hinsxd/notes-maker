"use client";

import { useState } from "react";

const Page = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async (isAnswerMode: boolean) => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isAnswerMode }),
      });

      if (!response.ok) {
        throw new Error("PDF generation failed");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error(error);
      alert("PDFの生成に失敗しました。");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="mb-4 text-2xl font-bold">PDF生成デモ</h1>
      <div className="space-x-4">
        <button
          onClick={() => generate(false)}
          className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={isGenerating}>
          {isGenerating ? "生成中..." : "生徒用バージョンを生成（セクション）"}
        </button>
        <button
          onClick={() => generate(true)}
          className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 disabled:opacity-50"
          disabled={isGenerating}>
          {isGenerating ? "生成中..." : "教師用バージョンを生成（セクション）"}
        </button>
      </div>
    </div>
  );
};

export default Page;
