import { GoogleGenAI, Type } from "@google/genai";

// Vercel Serverless Function
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topics, numQuestionsPerTopic } = req.body;

  if (!topics || !numQuestionsPerTopic) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  // API key from environment (no VITE_ prefix needed!)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in environment');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
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
    if (!text) {
      throw new Error("Generation failed - no response text");
    }
    
    const data = JSON.parse(text.trim());
    
    // Transform the data to match expected format
    const transformedTopics = data.topics.map((topic, tIndex) => ({
      id: `topic-${tIndex}`,
      title: topic.title,
      questions: topic.questions.map((q, qIndex) => ({
        ...q,
        id: `q-${tIndex}-${qIndex}`,
        isAnswered: false
      }))
    }));

    return res.status(200).json({ topics: transformedTopics });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    });
  }
}