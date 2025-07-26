import { LongQuestion, MultipleChoicesQuestion } from "@/lib/pdf/validation";

export const generateDummyLongQuestions = (count: number): LongQuestion[] => {
  return Array.from({ length: count }, (_, i) => ({
    type: "LongQuestion",
    questionText: `これはダミー問題${
      i + 1
    }の質問テキストです。テキストの折り返しがどのように機能するかを確認するために、少し長くなることがあります。`,
    answer: `答え ${i + 1}`,
  }));
};

export const generateDummyMultipleChoicesQuestions = (count: number): MultipleChoicesQuestion[] => {
  const sampleChoices = [
    ["ありがとうございます", "こんにちは", "さようなら", "こんばんは"],
    ["赤", "緑", "青", "黄"],
    ["犬", "猫", "鳥", "魚"],
    ["北海道", "東京都", "大阪府", "福岡県"],
  ];

  return Array.from({ length: count }, (_, i) => {
    const choices = sampleChoices[i % sampleChoices.length];

    return {
      type: "MultipleChoices",
      questionText: `これは選択問題${
        i + 1
      }です。最適な選択肢を選んでください。テキストは折り返しをテストするために非常に長くなることがあります。`,
      choices: [...choices],
      answer: choices[0],
    };
  });
};
