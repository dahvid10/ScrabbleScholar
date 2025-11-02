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
    const prompt = `You are a dictionary expert. Your task is to find all possible words from the given letters and then filter them based on their validity across three major English dictionaries.
Based on the letters '${letters}', first, generate a list of all potential words ${length ? `that are exactly ${length} letters long` : 'of any length'}.
Second, for each potential word, you MUST verify its validity in ALL THREE of the following major dictionaries:
1. Merriam-Webster Collegiate Dictionary
2. Oxford English Dictionary
3. Collins English Dictionary

A word is only considered valid if it exists in all three dictionaries.

Return the result ONLY as a JSON object with this exact schema: { "words": string[], "dictionarySource": "string", "dictionaryLink": "string" }.
- The 'words' array must contain only the words that are valid in all three dictionaries.
- If no such words are found, the 'words' array must be empty.
- The 'dictionarySource' property should be "Cross-validated (MW, OED, Collins)".
- The 'dictionaryLink' property should be an empty string.
- The result's 'words' array must be sorted by word length in descending order, then alphabetically.

Do not include any other text, explanations, or markdown formatting outside of the JSON object.`;

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

    // The model is now asked to sort, but we can keep client-side sorting as a fallback.
    if (result.words) {
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
    const prompt = `You are a dictionary expert. Using the ${dictionaryName} dictionary as your primary source, is the word '${word}' a valid word? Provide its definition if it is. Return the result ONLY as a JSON object with this exact schema: { "isValid": boolean, "definition": string }. The definition should be an empty string if the word is not valid or not found in that specific dictionary. Do not include any other text, explanations, or markdown formatting outside of the JSON object.`;
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
    const prompt = `You are a dictionary expert. For the word '${word}', check its validity in these three major English dictionaries: Merriam-Webster Collegiate Dictionary, Oxford English Dictionary, and Collins English Dictionary. Return the result ONLY as a JSON object with this exact schema: an array of objects, where each object is { "dictionaryName": string, "dictionaryDescription": string, "isValid": boolean }. The descriptions must be exactly: for Merriam-Webster Collegiate Dictionary "A leading American English dictionary.", for Oxford English Dictionary "The principal historical dictionary of the English language.", and for Collins English Dictionary "A major British English dictionary.". Do not include any other text, explanations, or markdown formatting outside of the JSON object.`;
    
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