
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> => {
  try {
    const prompt = `Translate the following text from ${sourceLang} to ${targetLang}. Provide only the translated text, without any additional explanations, introductions, or quotation marks.

Text to translate: "${text}"`;
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });

    return response.text.trim();
  } catch (error) {
    console.error("Error translating text with Gemini API:", error);
    throw new Error("Failed to get translation from Gemini API.");
  }
};