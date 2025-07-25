import type { Block } from "payload";

export const longQuestionBlock: Block = {
  slug: "LongQuestion",
  interfaceName: "LongQuestionBlock",
  admin: {
    disableBlockName: true,
  },
  fields: [
    {
      name: "questionText",
      type: "text",
      required: true,
      label: "Question Text",
    },
    {
      name: "answer",
      type: "textarea",
      required: true,
      label: "Answer",
    },
  ],
};

export const fillQuestionBlock: Block = {
  slug: "Fill",
  interfaceName: "FillQuestionBlock",
  admin: {
    disableBlockName: true,
  },
  fields: [
    {
      name: "questionText",
      type: "text",
      required: true,
      label: "Question Text",
      admin: {
        description: 'Use "<<>>" as a placeholder for the blank.',
      },
      validate: (value: unknown) => {
        if (typeof value === "string" && !value.includes("<<>>")) {
          return 'The question text must include "<<>>" as a placeholder.';
        }

        return true;
      },
    },
    {
      name: "answer",
      type: "text",
      required: true,
      label: "Answer",
    },
  ],
};

export const multipleChoicesQuestionBlock: Block = {
  slug: "MultipleChoices",
  interfaceName: "MultipleChoicesQuestionBlock",
  admin: {
    disableBlockName: true,
  },
  fields: [
    {
      name: "questionText",
      type: "text",
      required: true,
      label: "Question Text",
    },
    {
      name: "choices",
      type: "array",
      required: true,
      minRows: 2,
      fields: [
        {
          name: "choice",
          type: "text",
          required: true,
        },
      ],
    },
    {
      name: "answer",
      type: "text",
      required: true,
      label: "Correct Answer",
    },
  ],
};
