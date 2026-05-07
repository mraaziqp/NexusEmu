import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ScrapedMetadata {
  title: string;
  platform: string;
  year: string;
  genre: string;
  description: string;
  confidence: number;
}

export async function scrapeMetadata(filename: string): Promise<ScrapedMetadata> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not defined');
  }

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are the Nexus Emu Metadata Scraper. 
      Extract the game title, platform, and year from this messy rom filename: "${filename}".
      Also provide a short 1-sentence description and primary genre.
      Return ONLY a JSON object with keys: title, platform, year, genre, description, confidence (0-1).`,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = result.text.trim();
    return JSON.parse(text);
  } catch (error) {
    console.error('Metadata scraping failed:', error);
    return {
      title: filename,
      platform: 'Unknown',
      year: 'Unknown',
      genre: 'Unknown',
      description: 'System could not identify this ROM automatically.',
      confidence: 0
    };
  }
}
