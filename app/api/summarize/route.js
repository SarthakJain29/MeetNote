import OpenAI from "openai";
import dotenv from "dotenv";
import { supabase } from '@/lib/supabaseClient'
dotenv.config()


const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  const { transcript } = await req.json();
  const prompt = `Summarize this meeting and list follow-up tasks:\n${transcript}`;
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
  });
  const text = completion.choices[0].message.content;

  //storing summaries in db
  const { data: insertData, error } = await supabase
  .from('meetings')
  .insert([{ transcript, summary: text }])

  return Response.json({ summary: text });
}
