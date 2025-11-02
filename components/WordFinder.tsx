
import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';

const WordFinder: React.FC = () => {
  const [letters, setLetters] = useState('');
  const [length, setLength] = useState(7);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFindWords = async () => {
    if (!letters.trim()) {
      setError('Please enter some letters.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults([]);
    try {
      const words = await geminiService.findWords(letters.trim().toLowerCase(), length);
      setResults(words);
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

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-amber-900 mb-4">Word Finder</h2>
      <p className="text-gray-600 mb-6">Enter your available letters and desired word length to find Scrabble-valid words.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="md:col-span-2">
          <label htmlFor="letters" className="block text-sm font-medium text-gray-700 mb-1">Your Letters</label>
          <input
            id="letters"
            type="text"
            value={letters}
            onChange={(e) => setLetters(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., QWERTYU"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <div>
          <label htmlFor="length" className="block text-sm font-medium text-gray-700 mb-1">Word Length</label>
          <input
            id="length"
            type="number"
            value={length}
            onChange={(e) => setLength(parseInt(e.target.value, 10) || 1)}
            min="1"
            max="15"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>

      <button
        onClick={handleFindWords}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-amber-700 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-800 disabled:bg-amber-400 transition-colors duration-300"
      >
        {isLoading ? <><Spinner /> Searching...</> : 'Find Words'}
      </button>

      {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

      <div className="mt-8">
        {results.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Found {results.length} words:</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 text-center">
              {results.map((word) => (
                <div key={word} className="bg-amber-100 p-2 rounded-md shadow-sm text-amber-900 font-mono tracking-widest uppercase">
                  {word}
                </div>
              ))}
            </div>
          </div>
        )}
        {!isLoading && results.length === 0 && letters && (
            <div className="text-center text-gray-500 p-4 border-2 border-dashed rounded-lg">
                <p>No words found for the given letters and length.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default WordFinder;
