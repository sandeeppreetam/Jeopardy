import { GoogleGenAI, Type } from "@google/genai";

// --- VARIETY SYSTEM: replaces personas ---
// These are purely structural/creative writing instructions, not character voices.
// They guide HOW questions are framed without adding fluff to the output.

const ANGLES = [
  "Focus on origin stories — how things began, were named, or were invented.",
  "Focus on consequences — what happened AFTER the famous event or discovery.",
  "Focus on misconceptions — what most people get wrong about the topic.",
  "Focus on surprising connections between seemingly unrelated things.",
  "Focus on the 'almost' — things that nearly happened differently.",
  "Focus on the people behind famous things — collaborators, rivals, unsung figures.",
  "Focus on firsts and lasts — inaugural moments and final instances.",
  "Focus on etymology and naming — why things are called what they are.",
  "Focus on cross-cultural angles — how different societies relate to the same topic.",
  "Focus on scale and extremes — the biggest, smallest, fastest, longest, etc.",
];

const LENSES = [
  "Phrase clues as statements leading to a specific person, place, or thing.",
  "Use 'This [noun]...' or 'Known for...' phrasing to give helpful context in the clue.",
  "Lead with a striking or counterintuitive fact before narrowing to the answer.",
  "Frame harder clues with two intersecting facts — both must point to the same answer.",
  "Use comparison: 'Unlike X, this...' to orient the player.",
];

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSeed() {
  return Math.floor(100000 + Math.random() * 900000);
}

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

    const angle = pick(ANGLES);
    const lens = pick(LENSES);
    const seed = randomSeed();

    const prompt = `
[GENERATION SEED: ${seed}]
Use this seed to ensure a unique, non-repetitive set of questions distinct from any prior generation.

[CATEGORIES]
${topics.join(", ")}

[MISSION]
For EACH category, generate exactly ${numQuestionsPerTopic} questions with point values: ${pointValues.join(", ")}.

[CREATIVE ANGLE — apply subtly across all questions]
${angle}

[CLUE PHRASING STYLE — how to write each clue]
${lens}

[DIFFICULTY SCALE — strictly follow this for normal players]
${pointValues.map((pts, idx) => {
  if (idx === 0)
    return `${pts} pts: EASIEST — common knowledge. e.g. "Who painted the Mona Lisa?"`;
  if (idx === pointValues.length - 1)
    return `${pts} pts: CHALLENGING — requires solid trivia knowledge. Think pub quiz finals, not PhD defence. Still answerable.`;
  if (idx === Math.floor(pointValues.length / 2))
    return `${pts} pts: MEDIUM — not common knowledge but something an informed person might know. Jeopardy regular-round level.`;
  if (idx < Math.floor(pointValues.length / 2))
    return `${pts} pts: EASIER SIDE — a clear step up from ${pointValues[idx - 1]} pts.`;
  return `${pts} pts: HARDER SIDE — a clear step up from ${pointValues[idx - 1]} pts.`;
}).join('\n')}

Rules:
- Clear difficulty progression is mandatory — each tier must feel meaningfully harder than the one before.
- Every question must have exactly ONE correct answer.
- Clues should be concise. No flavour text, no host persona, no dramatic commentary — just a clean, well-crafted clue.
- Avoid ultra-obscure academic facts. Even the hardest question should be answerable by someone who reads broadly.
- Cover varied sub-topics, time periods, and regions within each category.
- Return strictly valid JSON.
    `;

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
                        points:   { type: Type.INTEGER },
                        question: { type: Type.STRING },
                        answer:   { type: Type.STRING }
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
        temperature: 1.2,
        topP: 0.92,
        topK: 45,
      }
    });

    const text = response.text;
    if (!text) throw new Error("Generation failed");

    const data = JSON.parse(text.trim());

    const transformedTopics = data.topics.map((topic, tIndex) => ({
      id: `topic-${tIndex}-${Date.now()}`,
      title: topic.title,
      questions: topic.questions.map((q, qIndex) => ({
        ...q,
        id: `q-${tIndex}-${qIndex}`,
        isAnswered: false
      }))
    }));

    return res.status(200).json({
      topics: transformedTopics,
      metadata: { angle, lens, seed }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate questions',
      details: error.message
    });
  }
}