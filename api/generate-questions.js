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

CRITICAL FRESHNESS REQUIREMENTS:
1. AVOID COMMON QUESTIONS: Never use overused trivia (e.g., "What is the capital of France?", "Who painted the Mona Lisa?")
2. MAXIMIZE VARIETY: Within each category, explore different:
   - Time periods (ancient, medieval, modern, contemporary)
   - Geographical regions (different countries and cultures)
   - Subtopics and angles (don't just focus on the most famous examples)
   - Question formats (who/what/when/where/how many/which/why)
3. MIX FAMOUS AND OBSCURE: Combine well-known facts with lesser-known interesting details
4. BE CREATIVE: Use unexpected angles, surprising connections, and interesting contexts

DIFFICULTY SCALING:
- ${pointValues[0]}-${pointValues[1]} points: Accessible but interesting questions
- ${pointValues[Math.floor(numQuestionsPerTopic/2)]} points: Moderate difficulty, requires specific knowledge
- ${pointValues[numQuestionsPerTopic-1]} points: Expert-level, challenging and obscure

QUALITY STANDARDS:
- Write clever Jeopardy-style clues with wordplay when appropriate
- Answers must be definitive and unambiguous (single correct answer)
- Questions should be educational and entertaining
- Ensure factual accuracy
- Return strictly valid JSON

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
        },
        // Higher temperature = more creative/random output
        temperature: 1.5,
        // Higher top_p = consider more token options for diversity
        topP: 0.95
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