import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { WordValidationResult, WordFinderResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set. This is a fatal error and the application cannot start.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeJsonParse = <T>(jsonString: string, fallback: T): T => {
  try {
    if (!jsonString) return fallback;
    // The Gemini API sometimes wraps JSON in ```json ... ```, so we strip that.
    const cleanJsonString = jsonString.replace(/^```json\s*/, '').replace(/```$/, '');
    return JSON.parse(cleanJsonString);
  } catch (e) {
    console.error("Failed to parse JSON response from API:", e);
    console.error("Invalid JSON string received:", jsonString);
    return fallback;
  }
};

export const findWords = async (letters: string, length?: number): Promise<WordFinderResult> => {
  try {
    const prompt = length
      ? `You are a Scrabble dictionary expert. You MUST strictly use words from the Merriam-Webster dictionary. Based on the letters '${letters}', find all possible Scrabble-valid words that are exactly ${length} letters long. Return the result ONLY as a JSON object with this exact schema: { "words": string[], "dictionarySource": "Merriam-Webster", "dictionaryLink": "https://www.merriam-webster.com/" }. If no words are found, the 'words' array must be empty. Do not include any other text, explanations, or markdown formatting outside of the JSON object.`
      : `You are a Scrabble dictionary expert. You MUST strictly use words from the Merriam-Webster dictionary. Based on the letters '${letters}', find all possible Scrabble-valid words of any length. The result's 'words' array must be sorted by word length in descending order. Return the result ONLY as a JSON object with this exact schema: { "words": string[], "dictionarySource": "Merriam-Webster", "dictionaryLink": "https://www.merriam-webster.com/" }. If no words are found, the 'words' array must be empty. Do not include any other text, explanations, or markdown formatting outside of the JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            words: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            dictionarySource: { type: Type.STRING },
            dictionaryLink: { type: Type.STRING }
          },
          required: ['words', 'dictionarySource', 'dictionaryLink']
        },
      },
    });
    
    const result = safeJsonParse<WordFinderResult>(response.text, { words: [], dictionarySource: '', dictionaryLink: '' });

    if (!length && result.words) {
        result.words.sort((a, b) => b.length - a.length || a.localeCompare(b));
    }
    
    return result;
  } catch (error) {
    console.error("Error finding words:", error);
    throw new Error("An issue occurred while finding words. The AI model might be temporarily unavailable. Please try again later.");
  }
};

export const validateWord = async (word: string): Promise<WordValidationResult> => {
   try {
    const prompt = `You are a Scrabble dictionary expert using the Merriam-Webster dictionary. Is the word '${word}' a valid Scrabble word according to Merriam-Webster? Provide its definition if it is. Return the result ONLY as a JSON object with this exact schema: { "isValid": boolean, "definition": string }. The definition should be an empty string if the word is not valid. Do not include any other text, explanations, or markdown formatting outside of the JSON object.`;
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            definition: { type: Type.STRING }
          },
          required: ['isValid', 'definition']
        },
      },
    });
    return safeJsonParse<WordValidationResult>(response.text, { isValid: false, definition: "Could not parse the response from the AI. Please try again." });
  } catch (error) {
    console.error("Error validating word:", error);
    throw new Error("An issue occurred while validating the word. The AI model might be temporarily unavailable. Please try again later.");
  }
};

export const analyzeBoard = async (image: { inlineData: { data: string; mimeType: string } }, letters: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                image,
                { text: `You are a Scrabble strategy grandmaster. The user has uploaded an image of their Scrabble board. Their current letters are '${letters}'. Analyze the board and suggest the top 3 optimal moves. For each move, describe the word, its position, and the score. Explain the strategic reasoning. Format your response as clean, simple markdown.` }
            ]
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error analyzing board:", error);
    throw new Error("Failed to analyze the board image. Please ensure the image is clear and try again.");
  }
};

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
        systemInstruction: 'You are a friendly and knowledgeable Scrabble expert. Answer any questions about rules, strategy, word origins, or anything else related to the game of Scrabble.',
    }
  });
};