import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function startRealtimeSession() {
  const session = await client.beta.realtime.sessions.create({
    model: "gpt-4o-realtime-preview",
    voice: "alloy",
    instructions: `
You are a professional German speaking exam examiner.

Rules:
- Speak  in German ,english and malayalam
- Ask German speaking test questions
- Wait for student answers
- Correct mistakes politely
- Continue conversation naturally
- Simulate TestDaF / Goethe speaking exam
`,
  });

  return session;
}