export enum AppView {
  WordFinder = 'Word Finder',
  Validator = 'Validator',
  BoardAnalyzer = 'Board Analyzer',
  AIChat = 'AI Chat',
}

export enum Theme {
  Light = 'light',
  Dark = 'dark',
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface DefinitionResult {
  isValid: boolean;
  definition: string;
}

export interface ValidityStatus {
  dictionaryName: string;
  dictionaryDescription: string;
  isValid: boolean;
}

export interface WordFinderResult {
  words: string[];
  dictionarySource: string;
  dictionaryLink: string;
}