import { fillQuestionBlock, longQuestionBlock, multipleChoicesQuestionBlock } from "./Exercises/blocks/question";
import { sectionBlock } from "./Exercises/blocks/section";
import type { CollectionConfig } from "payload";

export const Exercises: CollectionConfig = {
  slug: "exercises",
  admin: {
    useAsTitle: "title",

    components: {
      edit: {
        beforeDocumentControls: ["@/components/GeneratePdfButton#GeneratePdfButton"],
        // editMenuItems: ["@/components/GeneratePdfButton"],
      },
    },
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      name: "items",
      type: "blocks",
      label: "Content Items",
      minRows: 1,
      blocks: [longQuestionBlock, fillQuestionBlock, multipleChoicesQuestionBlock, sectionBlock],
    },
  ],
};
