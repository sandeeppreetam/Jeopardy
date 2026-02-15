import { GoogleGenAI } from "@google/genai";

// Vercel Serverless Function
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: 'Missing question or answer' });
  }

  // API key from environment (no VITE_ prefix needed!)
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('GEMINI_API_KEY not set in environment');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Provide a very subtle, cryptic, and short hint for this trivia question. 
    Do NOT give away the answer.
    QUESTION: "${question}"
    ANSWER: "${answer}"
    HINT:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt
    });

    const hint = response.text?.trim() || "No hint available.";

    return res.status(200).json({ hint });
  } catch (error) {
    console.error('Error generating hint:', error);
    return res.status(500).json({ 
      error: 'Failed to generate hint',
      hint: 'Hint unavailable.'
    });
  }
}