import { fillQuestionBlock, longQuestionBlock, multipleChoicesQuestionBlock } from "./question";
import type { Block } from "payload";

export const sectionBlock: Block = {
  slug: "section",
  interfaceName: "SectionBlock",
  admin: {
    disableBlockName: true,
  },
  fields: [
    {
      name: "description",
      type: "textarea",
      required: true,
      label: "Description",
    },
    {
      name: "questions",
      type: "blocks",
      minRows: 1,
      blocks: [longQuestionBlock, fillQuestionBlock, multipleChoicesQuestionBlock],
    },
  ],
};
