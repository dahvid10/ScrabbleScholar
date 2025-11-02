
import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { WordValidationResult } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const findWords = async (letters: string, length: number): Promise<string[]> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Scrabble dictionary expert. Based on the letters '${letters}', find all possible Scrabble-valid words that are exactly ${length} letters long. Return the result as a JSON array of strings. If no words are found, return an empty array.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        },
      },
    });
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error finding words:", error);
    throw new Error("Failed to find words. Please check your letters and try again.");
  }
};

export const validateWord = async (word: string): Promise<WordValidationResult> => {
   try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are a Scrabble dictionary expert. Is the word '${word}' a valid Scrabble word? Provide its definition if it is. Return the result as a JSON object with two keys: 'isValid' (boolean) and 'definition' (string, or an empty string if not valid).`,
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
    const jsonString = response.text.trim();
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error validating word:", error);
    throw new Error("Failed to validate the word. Please try again.");
  }
};

export const analyzeBoard = async (image: { inlineData: { data: string; mimeType: string } }, letters: string): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                image,
                { text: `You are a Scrabble strategy grandmaster. The user has uploaded an image of their Scrabble board. Their current letters are '${letters}'. Analyze the board and suggest the top 3 optimal moves. For each move, describe the word, its position, and the score. Explain the strategic reasoning. Format your response as markdown.` }
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
