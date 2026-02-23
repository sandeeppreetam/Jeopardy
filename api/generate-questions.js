import { GoogleGenAI, Type } from "@google/genai";

function randomSeed() {
  return Math.floor(100000 + Math.random() * 900000);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { topics, numQuestionsPerTopic, usedQuestions = [] } = req.body;

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
    const seed = randomSeed();

    // Build per-category exclusion blocks
    const exclusionBlock = (() => {
      if (!usedQuestions.length) return '';

      const byCategory = {};
      usedQuestions.forEach(({ category, answer, question }) => {
        const matchedTopic = topics.find(t =>
          t.toLowerCase().includes(category) || category.includes(t.toLowerCase())
        );
        if (!matchedTopic) return;
        if (!byCategory[matchedTopic]) byCategory[matchedTopic] = [];
        byCategory[matchedTopic].push({ answer, question });
      });

      const lines = Object.entries(byCategory).map(([topic, items]) => {
        const answerList = items.map(i => `"${i.answer}"`).join(', ');
        const questionSnippets = items.map(i => `"${i.question.slice(0, 60)}"`).join('\n    ');
        return `${topic}:\n  Do NOT use these answers: ${answerList}\n  Do NOT reuse clues similar to:\n    ${questionSnippets}`;
      });

      return lines.length
        ? `\n[EXCLUSIONS — already seen by this player, do not repeat]\n${lines.join('\n\n')}\n`
        : '';
    })();

    const prompt = `
[GENERATION SEED: ${seed}]
${exclusionBlock}
[CATEGORIES]
${topics.join(", ")}

[MISSION]
For EACH category, generate exactly ${numQuestionsPerTopic} questions with point values: ${pointValues.join(", ")}.

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
- Clues should be concise. No flavour text, no dramatic commentary — just a clean, well-crafted clue.
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
      metadata: { seed, excludedCount: usedQuestions.length }
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({
      error: 'Failed to generate questions',
      details: error.message
    });
  }
}