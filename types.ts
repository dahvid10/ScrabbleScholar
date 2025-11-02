export enum AppView {
  WordFinder = 'Word Finder',
  Validator = 'Validator',
  BoardAnalyzer = 'Board Analyzer',
  AIChat = 'AI Chat',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface WordValidationResult {
  isValid: boolean;
  definition: string;
}

export interface WordFinderResult {
  words: string[];
  dictionarySource: string;
  dictionaryLink: string;
}
