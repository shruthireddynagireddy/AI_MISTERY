import { GoogleGenAI } from '@google/genai';
import { buildMysteryPrompt } from '../prompts/mysteryPrompt.js';
export async function generateWithGemini(input) {
  if (!process.env.GEMINI_API_KEY) return null;
  const ai = new GoogleGenAI({apiKey:process.env.GEMINI_API_KEY});
  const response = await ai.models.generateContent({model:process.env.GEMINI_MODEL||'gemini-2.5-flash',contents:buildMysteryPrompt(input),config:{responseMimeType:'application/json',temperature:0.75}});
  const text=response.text;
  if(!text) throw new Error('Empty AI response');
  return JSON.parse(text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,''));
}
