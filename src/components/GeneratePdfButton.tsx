"use client";

import { useParams } from "next/navigation";

import { Button, PopupList } from "@payloadcms/ui";

export const GeneratePdfButton = () => {
  const { segments } = useParams();

  const idStr = segments?.at(-1);
  const parsedId = idStr ? parseInt(idStr) : null;
  const id = parsedId || 0;

  const onClick = async (isAnswerMode: boolean) => {
    if (!id) {
      alert("Please save the document before generating a PDF.");

      return;
    }

    window.open(`/api/generate-pdf?id=${id}&isAnswerMode=${isAnswerMode}`, "_blank");
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
