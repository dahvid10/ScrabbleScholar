
import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';
import { WordValidationResult } from '../types';

const WordValidator: React.FC = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<WordValidationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleValidateWord = async () => {
    if (!word.trim()) {
      setError('Please enter a word to validate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const validationResult = await geminiService.validateWord(word.trim().toLowerCase());
      setResult(validationResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleValidateWord();
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-amber-900 mb-4">Word Validator</h2>
      <p className="text-gray-600 mb-6">Check if a word is valid according to the official Scrabble dictionary and see its definition.</p>
      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter a word..."
          className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
        />
        <button
          onClick={handleValidateWord}
          disabled={isLoading}
          className="flex-shrink-0 flex justify-center items-center gap-2 bg-amber-700 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-800 disabled:bg-amber-400 transition-colors duration-300"
        >
          {isLoading ? <Spinner /> : 'Check'}
        </button>
      </div>

      {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</div>}

      {result && (
        <div className={`mt-8 p-4 rounded-lg ${result.isValid ? 'bg-green-100 border-green-400' : 'bg-red-100 border-red-400'} border`}>
          <h3 className={`text-xl font-bold ${result.isValid ? 'text-green-800' : 'text-red-800'}`}>
            "{word}" is {result.isValid ? 'a valid' : 'not a valid'} Scrabble word.
          </h3>
          {result.isValid && result.definition && (
            <p className="mt-2 text-gray-700"><strong>Definition:</strong> {result.definition}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default WordValidator;
