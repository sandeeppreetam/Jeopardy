
import { GoogleGenAI, Type } from "@google/genai";
import { Topic } from "../types";

export const generateQuestions = async (
  topics: string[], 
  numQuestionsPerTopic: number
): Promise<Topic[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pointValues = Array.from({ length: numQuestionsPerTopic }, (_, i) => (i + 1) * 50);
  
  const prompt = `You are a professional trivia host and researcher for a high-stakes game show like Jeopardy.
Generate a set of sophisticated and engaging trivia questions for the following categories: ${topics.join(", ")}.

For EACH topic, provide exactly ${numQuestionsPerTopic} questions with these point values: ${pointValues.join(", ")}.

CRITICAL INSTRUCTIONS FOR QUALITY:
1. DIFFICULTY SCALING: Low-value (50-100) are accessible, high-value (200+) are for experts.
2. PHRASING: Write clever clues with wordplay.
3. ANSWERS: Ensure definitive and unambiguous answers.
4. FORMAT: Return strictly valid JSON.

Category list: ${topics.join(", ")}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          topics: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                questions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      points: { type: Type.INTEGER },
                      question: { type: Type.STRING },
                      answer: { type: Type.STRING }
                    },
                    required: ["points", "question", "answer"]
                  }
                }
              },
              required: ["title", "questions"]
            }
          }
        },
        required: ["topics"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("Generation failed");
  
  const data = JSON.parse(text.trim());
  
  return data.topics.map((topic: any, tIndex: number) => ({
    id: `topic-${tIndex}`,
    title: topic.title,
    questions: topic.questions.map((q: any, qIndex: number) => ({
      ...q,
      id: `q-${tIndex}-${qIndex}`,
      isAnswered: false
    }))
  }));
};

export const getQuestionHint = async (question: string, answer: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Provide a very subtle, cryptic, and short hint for this trivia question. 
  Do NOT give away the answer.
  QUESTION: "${question}"
  ANSWER: "${answer}"
  HINT:`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  });

  return response.text?.trim() || "No hint available.";
};
