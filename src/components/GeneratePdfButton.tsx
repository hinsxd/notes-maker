"use client";

import { useParams } from "next/navigation";

import { Button, PopupList } from "@payloadcms/ui";

export const GeneratePdfButton = () => {
  const { segments } = useParams();
  console.log(segments);

  const idStr = segments?.at(-1);
  const parsedId = idStr ? parseInt(idStr) : null;
  const id = parsedId || 0;

  const onClick = async (isAnswerMode: boolean) => {
    if (!id) {
      alert("Please save the document before generating a PDF.");

      return;
    }

    try {
      const res = await fetch(`/api/generate-pdf?id=${id}&isAnswerMode=${isAnswerMode}`);

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to generate PDF");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `exercise-${id}${isAnswerMode ? "-answers" : ""}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("An unknown error occurred.");
      }
      console.error(error);
    }
  };

  return (
    <>
      <Button disabled={!id} onClick={() => onClick(false)}>
        Generate PDF
      </Button>
      <Button disabled={!id} onClick={() => onClick(true)}>
        Generate with Answers
      </Button>
    </>
  );

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={() => onClick(false)}>Generate Questions</PopupList.Button>
      <PopupList.Button onClick={() => onClick(true)}>Generate with Answers</PopupList.Button>
    </PopupList.ButtonGroup>
  );
};
