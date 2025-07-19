import { LongQuestion, MultipleChoicesQuestion } from "./types";

export const generateDummyLongQuestions = (count: number): LongQuestion[] => {
  return Array.from({ length: count }, (_, i) => ({
    type: "longQuestion",
    questionText: `This is the question text for dummy question number ${
      i + 1
    }. It can be a bit long to see how the text wrapping works.`,
    answer: `Answer ${i + 1}`,
  }));
};

export const generateDummyMultipleChoicesQuestions = (count: number): MultipleChoicesQuestion[] => {
  const sampleChoices = [
    ["Apple", "Banana", "Orange", "Grape"],
    ["Red", "Green", "Blue", "Yellow"],
    ["Dog", "Cat", "Bird", "Fish"],
    ["Paris", "London", "New York", "Tokyo"],
  ];

  return Array.from({ length: count }, (_, i) => {
    const choices = sampleChoices[i % sampleChoices.length];

    return {
      type: "MultipleChoices",
      questionText: `This is a multiple choice question, number ${
        i + 1
      }. Please select the best option. The text can be quite long to test wrapping.`,
      choices: [...choices],
      answer: choices[0],
    };
  });
};
