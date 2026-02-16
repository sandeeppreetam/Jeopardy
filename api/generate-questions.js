import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topics, numQuestionsPerTopic } = req.body;

  if (!topics || !numQuestionsPerTopic) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const pointValues = Array.from({ length: numQuestionsPerTopic }, (_, i) => (i + 1) * 50);
    
    // --- STEP 1: ADD VARIETY GENERATORS ---
    const personas = [
      "a witty Oxford professor who loves terrible puns",
      "a high-energy 90s game show host with a flair for the dramatic",
      "a mysterious librarian who knows everyone's secrets",
      "a snarky tech billionaire who thinks they're the smartest in the room",
      "a time-traveling historian who treats every fact like a personal memory"
    ];

    const wildcards = [
      "Focus on 'Firsts' and 'Lasts'—the beginnings and ends of eras.",
      "Incorporate clever wordplay or puns into the clues themselves.",
      "The 'Six Degrees' rule: Try to connect the facts to a modern pop culture icon.",
      "The 'Underdog' Perspective: Highlight figures or events that history books often skip.",
      "Frame clues as 'Who am I?' or 'What am I?' riddles.",
      "Double-layered clues: Include a helpful hint within the clue's phrasing.",
      "Focus on 'Mistakes that changed the world'—serendipity and accidents.",
      "Contrast: Frame the question by comparing two things that shouldn't be related."
    ];
    
    const selectedPersona = personas[Math.floor(Math.random() * personas.length)];
    const selectedWildcard = wildcards[Math.floor(Math.random() * wildcards.length)];
    
    // --- STEP 2: CRAFT THE THEATRICAL PROMPT ---
    const prompt = `
      [STORY SETTING]
      You are ${selectedPersona}. You are writing clues for tonight's championship round. 
      The audience is highly educated and hates "boring" trivia. 
      Your secret writing prompt for tonight is: "${selectedWildcard}"

      [THE CATEGORIES]
      ${topics.join(", ")}

      [THE MISSION]
      For EACH category, generate exactly ${numQuestionsPerTopic} questions with values: ${pointValues.join(", ")}.

      [WRITING STYLE: THE JEOPARDY STANDARD]
      1. NO ELEMENTARY QUESTIONS: Never ask "What is the capital of X?". 
      2. THE 'TWO-STEP' RULE: For high-value questions (${pointValues[pointValues.length - 1]}), the player should need to connect two facts.
         - Bad: "Who was the 16th president?" 
         - Good: "This man, a licensed bartender before he was President, is the only one to hold a patent, specifically for a device to lift boats over shoals."
      3. DEFINITIVE ANSWERS: Despite the creative phrasing, there must be only ONE possible correct answer.
      4. FRESHNESS: Use modern contexts, recent discoveries, or obscure but verifiable historical intersections.

      [CONSTRAINTS]
      - Return strictly valid JSON.
      - Keep clues evocative but concise.
      - Ensure point difficulty scales appropriately.
    `;

    // --- STEP 3: EXECUTE WITH OPTIMIZED PARAMETERS ---
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
        // 1.25 is high enough for "fun" but low enough to remain factually grounded
        temperature: 1.25, 
        topP: 0.9,
        topK: 40
      }
    });

    const text = response.text;
    if (!text) throw new Error("Generation failed");
    
    const data = JSON.parse(text.trim());
    
    const transformedTopics = data.topics.map((topic, tIndex) => ({
      id: `topic-${tIndex}-${Date.now()}`, // Added timestamp for uniqueness
      title: topic.title,
      questions: topic.questions.map((q, qIndex) => ({
        ...q,
        id: `q-${tIndex}-${qIndex}`,
        isAnswered: false
      }))
    }));

    return res.status(200).json({ 
      topics: transformedTopics,
      metadata: {
        persona: selectedPersona,
        wildcard: selectedWildcard
      }
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate questions',
      details: error.message 
    });
  }
}