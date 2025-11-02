import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';
import { DefinitionResult } from '../types';
import DefinitionModal from './DefinitionModal';

const WordFinder: React.FC = () => {
  const [letters, setLetters] = useState('');
  const [length, setLength] = useState('7');
  const [anyLength, setAnyLength] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [dictionarySource, setDictionarySource] = useState<{name: string; link: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // State for definition modal
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [definitionResult, setDefinitionResult] = useState<DefinitionResult | null>(null);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState(false);
  const [definitionError, setDefinitionError] = useState<string | null>(null);

  const handleFindWords = async () => {
    if (!letters.trim()) {
      setError('Please enter some letters.');
      return;
    }

    if (!anyLength) {
      const numericLength = parseInt(length, 10);
      if (isNaN(numericLength) || numericLength < 1 || numericLength > 15) {
        setError('Please enter a valid word length between 1 and 15.');
        return;
      }
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setDictionarySource(null);
    setSearchPerformed(true);
    try {
      const numericLength = anyLength ? undefined : parseInt(length, 10);
      const result = await geminiService.findWords(letters.trim().toLowerCase(), numericLength);
      setResults(result.words);
      if (result.words.length > 0 && result.dictionarySource && result.dictionaryLink !== null) {
        setDictionarySource({ name: result.dictionarySource, link: result.dictionaryLink });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleFindWords();
    }
  };

  const handleWordClick = async (word: string) => {
    setSelectedWord(word);
    setIsDefinitionLoading(true);
    setDefinitionResult(null);
    setDefinitionError(null);
    try {
      const result = await geminiService.getWordDefinition(word);
      setDefinitionResult(result);
    } catch (err: any) {
      setDefinitionError(err.message || 'Failed to fetch definition.');
    } finally {
      setIsDefinitionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedWord(null);
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-300 mb-4">Word Finder</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Enter your letters to find all possible words. Click on a word to see its definition.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <label htmlFor="letters" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Letters</label>
          <input
            id="letters"
            type="text"
            value={letters}
            onChange={(e) => {
              setLetters(e.target.value.replace(/[^a-zA-Z]/g, ''));
              setSearchPerformed(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="e.g., QWERTYU"
            className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
          />
        </div>
        <div>
          <div className="flex justify-between items-center mb-1">
            <label htmlFor="length" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Word Length</label>
            <div className="flex items-center">
              <input
                id="any-length"
                type="checkbox"
                checked={anyLength}
                onChange={(e) => {
                  setAnyLength(e.target.checked);
                  setSearchPerformed(false);
                }}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="any-length" className="ml-2 text-sm text-gray-900 dark:text-gray-100">Any</label>
            </div>
          </div>
          <input
            id="length"
            type="number"
            value={length}
            onChange={(e) => {
              setLength(e.target.value);
              setSearchPerformed(false);
            }}
            onKeyDown={handleKeyDown}
            min="1"
            max="15"
            disabled={anyLength}
            className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100 disabled:cursor-not-allowed dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:disabled:bg-gray-600"
          />
        </div>
      </div>

      <button
        onClick={handleFindWords}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-amber-700 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-800 disabled:bg-amber-400 transition-colors duration-300 dark:bg-amber-600 dark:hover:bg-amber-700"
      >
        {isLoading ? <><Spinner /> Searching...</> : 'Find Words'}
      </button>

      {error && <div className="mt-4 text-center text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50 p-3 rounded-md" role="alert" aria-live="polite">{error}</div>}

      <div className="mt-8" aria-live="polite">
        {results.length > 0 && (
          <div>
            <div className="flex flex-wrap justify-between items-baseline gap-2 mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Found {results.length} words:</h3>
              {dictionarySource && (
                  dictionarySource.link ? (
                      <a 
                          href={dictionarySource.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-xs text-amber-700 dark:text-amber-400 hover:underline"
                          aria-label={`Dictionary source: ${dictionarySource.name}`}
                      >
                          Source: {dictionarySource.name}
                      </a>
                  ) : (
                      <span className="text-xs text-amber-700 dark:text-amber-400" aria-label={`Dictionary source: ${dictionarySource.name}`}>
                          Source: {dictionarySource.name}
                      </span>
                  )
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center">
              {results.map((word) => (
                <button 
                  key={word} 
                  onClick={() => handleWordClick(word)}
                  className="bg-amber-100 text-amber-900 font-mono tracking-widest uppercase hover:bg-amber-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600 transition-colors duration-200 dark:bg-gray-700 dark:text-amber-200 dark:hover:bg-gray-600"
                  aria-label={`Get definition for ${word}`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        )}
        {searchPerformed && !isLoading && results.length === 0 && (
            <div className="text-center text-gray-500 dark:text-gray-400 p-4 border-2 border-dashed dark:border-gray-600 rounded-lg">
                <p>No words found for the given letters and length.</p>
            </div>
        )}
      </div>

      {selectedWord && (
        <DefinitionModal
          word={selectedWord}
          definitionResult={definitionResult}
          isLoading={isDefinitionLoading}
          error={definitionError}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default WordFinder;