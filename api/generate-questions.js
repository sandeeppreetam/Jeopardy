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
      "a high-energy 90s game show host with a flair for the dramatic",
      "a mysterious librarian who knows everyone's secrets",
      "a snarky tech billionaire who thinks they're the smartest in the room",
      "a retired cinema villain who roasts wrong answers like a dramatic monologue",
      "a hyper competitive cricket commentator who treats every question like a World Cup final",
      "a chill Bengaluru startup bro who rates your answers like pitch decks",
      "a dramatic mythology narrator who reacts to every answer like it changes destiny",
      "a sarcastic older sibling who never lets you forget your mistakes",
      "a devotional temple announcer who treats correct answers like divine blessings",
      "a chaotic meme page admin who replies only in viral references",
      "a strict Indian school principal who deducts imaginary marks for confidence",
      "a late night radio jockey who turns every question into a life lesson",
      "a friendly chai shop uncle who gives trivia along with unsolicited advice",
      "a fitness coach who shouts encouragement even when you get it wrong",
      "a courtroom lawyer who cross examines your logic before accepting an answer",
      "a sci fi spaceship AI that is slightly disappointed in humanity",
      "a melodramatic soap opera mom who reacts emotionally to every choice",
      "a calm monk who treats the quiz like a test of inner balance"
    ];

    const wildcards = [
      "Focus on 'Firsts' and 'Lasts'— the beginnings and ends of eras. Don't be over focused on years.",
      "The 'Underdog' Perspective: Highlight figures or events that history books often skip.",
      "Frame clues as 'Who am I?' or 'What am I?' riddles.",
      "Double-layered clues: Include a helpful hint within the clue's phrasing. Only do it for 10% of questions.",
      "Focus on 'Mistakes that changed the world'—serendipity and accidents.",
      "Contrast: Frame the question by comparing two things that shouldn't be related."
    ];
    
    const selectedPersona = personas[Math.floor(Math.random() * personas.length)];
    const selectedWildcard = wildcards[Math.floor(Math.random() * wildcards.length)];
    
    // --- STEP 2: CRAFT THE THEATRICAL PROMPT WITH STRICT DIFFICULTY ORDERING ---
    const prompt = `
      [STORY SETTING]
      You are ${selectedPersona}. You are writing clues for tonight's championship round. 
      The audience is highly educated and hates "boring" trivia. 
      Your secret writing prompt for tonight is: "${selectedWildcard}"

      [THE CATEGORIES]
      ${topics.join(", ")}

      [THE MISSION]
      For EACH category, generate exactly ${numQuestionsPerTopic} questions with values: ${pointValues.join(", ")}.

      [CRITICAL: STRICT DIFFICULTY PROGRESSION FOR NORMAL PLAYERS]
      **EACH QUESTION MUST STRICTLY FOLLOW THIS DIFFICULTY SCALE:**
      
      IMPORTANT: These are questions for regular people playing a fun trivia game, NOT professional quiz competitors.
      Even the "hardest" questions should still be ANSWERABLE by someone with decent general knowledge.
      
      ${pointValues.map((points, idx) => {
        if (idx === 0) {
          return `- ${points} points: EASIEST - Common knowledge that most people know. Examples: "Who painted the Mona Lisa?" or "What planet is known as the Red Planet?"`;
        } else if (idx === pointValues.length - 1) {
          return `- ${points} points: CHALLENGING - Requires good trivia knowledge or connecting multiple facts. Still answerable by someone who reads or watches documentaries. Think "pub quiz championship round" not "PhD defense."`;
        } else if (idx === Math.floor(pointValues.length / 2)) {
          return `- ${points} points: MEDIUM - Not common knowledge but something a reasonably informed person might know. Think "Could appear on Jeopardy's regular rounds."`;
        } else if (idx < Math.floor(pointValues.length / 2)) {
          return `- ${points} points: EASIER SIDE - Slightly harder than ${pointValues[idx-1]} but still fairly accessible.`;
        } else {
          return `- ${points} points: HARDER SIDE - More challenging than ${pointValues[idx-1]}, requires more specific knowledge.`;
        }
      }).join('\n      ')}

      **YOU MUST ENSURE:**
      1. A ${pointValues[0]} point question should be noticeably easier than ${pointValues[1]} points
      2. Each subsequent point value represents a CLEAR step up in difficulty
      3. The ${pointValues[pointValues.length-1]} point question should be challenging but NOT impossible
      4. All questions should be ANSWERABLE - no ultra-obscure academic facts that only specialists would know
      5. DO NOT make all questions equally hard or equally easy - there MUST be clear progression

      [WRITING STYLE: THE JEOPARDY STANDARD FOR HOME PLAYERS]
      1. NO ELEMENTARY QUESTIONS FOR LOW VALUES: Make them interesting, not "What is 2+2?"
      2. NO IMPOSSIBLE QUESTIONS FOR HIGH VALUES: Challenge the player, don't stump everyone in the room
      3. THE 'CLUE' APPROACH: For harder questions, give helpful context in the question itself
         - Bad (too hard): "Who was Nixon's dog?" 
         - Good (challenging but fair): "This president's dog was named Checkers, made famous in a 1952 speech"
      4. DEFINITIVE ANSWERS: Despite the creative phrasing, there must be only ONE possible correct answer
      5. FRESHNESS: Use modern contexts, recent discoveries, or interesting historical connections
      6. VARIETY: Even within one category, explore different time periods, regions, and sub-topics
      7. KEEP IT FUN: The goal is entertainment, not humiliation. Players should feel smart when they get answers right!

      [DIFFICULTY CALIBRATION EXAMPLES FOR NORMAL PLAYERS]
      
      For a "US Presidents" category with 4 questions:
      - 50 pts: "This founding father was the first US President" → George Washington (everyone knows this)
      - 100 pts: "This president delivered the Gettysburg Address" → Abraham Lincoln (well-known)
      - 150 pts: "The only president to serve more than two terms" → FDR (requires some history knowledge)
      - 200 pts: "This president's dog was named Checkers, made famous in a 1952 speech" → Richard Nixon (challenging but answerable)
      
      Notice: Even the 200-point question is something a history buff or older person might know. It's NOT "What was Nixon's dog's vaccination record?" (impossible).

      [CONSTRAINTS]
      - Return strictly valid JSON.
      - Keep clues evocative but concise.
      - Ensure point difficulty scales appropriately from easiest (${pointValues[0]}) to hardest (${pointValues[pointValues.length-1]}).
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