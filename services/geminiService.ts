import { Topic } from "../types";

interface UsedQuestion {
  category: string;
  answer: string;
  question: string;
}

export const generateQuestions = async (
  topics: string[],
  numQuestionsPerTopic: number,
  usedQuestions: UsedQuestion[] = []
): Promise<{ topics: Topic[], theme: string }> => {
  try {
    const response = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topics,
        numQuestionsPerTopic,
        usedQuestions
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to generate questions');
    }

    const data = await response.json();
    return {
      topics: data.topics,
      theme: data.theme
    };
  } catch (error: any) {
    console.error('Failed to generate questions:', error);
    throw error;
  }
};

export const getQuestionHint = async (question: string, answer: string): Promise<string> => {
  try {
    const response = await fetch('/api/generate-hint', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        answer
      })
    });

    if (!response.ok) {
      const error = await response.json();
      return error.hint || "Hint unavailable.";
    }

    const data = await response.json();
    return data.hint;
  } catch (error) {
    console.error('Error generating hint:', error);
    return "Hint generation failed.";
  }
};