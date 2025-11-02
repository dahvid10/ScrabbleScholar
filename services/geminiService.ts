import { GoogleGenAI, Chat, Type, GenerateContentResponse } from "@google/genai";
import { DefinitionResult, ValidityStatus, WordFinderResult } from '../types';

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

export const getWordDefinition = async (word: string, dictionaryName: string = 'Merriam-Webster'): Promise<DefinitionResult> => {
   try {
    const prompt = `You are a dictionary expert. Using the ${dictionaryName} dictionary as your primary source, is the word '${word}' a valid Scrabble word? Provide its definition if it is. Return the result ONLY as a JSON object with this exact schema: { "isValid": boolean, "definition": string }. The definition should be an empty string if the word is not valid or not found in that specific dictionary. Do not include any other text, explanations, or markdown formatting outside of the JSON object.`;
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
    return safeJsonParse<DefinitionResult>(response.text, { isValid: false, definition: "Could not parse the response from the AI. Please try again." });
  } catch (error) {
    console.error("Error getting word definition:", error);
    throw new Error("An issue occurred while getting the definition. The AI model might be temporarily unavailable. Please try again later.");
  }
};

export const crossValidateWord = async (word: string): Promise<ValidityStatus[]> => {
  try {
    const prompt = `You are a Scrabble dictionary expert. For the word '${word}', check its validity in these three official dictionaries: Merriam-Webster Official Scrabble Players Dictionary (OSPD), Collins Scrabble Words (CSW), and The Official Tournament and Club Word List (TWL). Return the result ONLY as a JSON object with this exact schema: an array of objects, where each object is { "dictionaryName": string, "dictionaryDescription": string, "isValid": boolean }. The descriptions must be exactly: for OSPD "Used in the USA, Canada, and Thailand for recreational play.", for CSW "Used in most English-speaking countries for tournaments and clubs.", and for TWL "Used for official club and tournament play in North America.". Do not include any other text, explanations, or markdown formatting outside of the JSON object.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              dictionaryName: { type: Type.STRING },
              dictionaryDescription: { type: Type.STRING },
              isValid: { type: Type.BOOLEAN }
            },
            required: ['dictionaryName', 'dictionaryDescription', 'isValid']
          }
        },
      },
    });

    return safeJsonParse<ValidityStatus[]>(response.text, []);
  } catch (error) {
    console.error("Error cross-validating word:", error);
    throw new Error("An issue occurred while validating the word across dictionaries. The AI model might be temporarily unavailable. Please try again later.");
  }
}

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
