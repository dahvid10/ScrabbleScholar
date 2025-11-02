import React, { useState } from 'react';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';
import { ValidityStatus, DefinitionResult } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';

const WordValidator: React.FC = () => {
  const [word, setWord] = useState('');
  const [results, setResults] = useState<ValidityStatus[] | null>(null);
  const [definitions, setDefinitions] = useState<Record<string, DefinitionResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isDefinitionLoading, setIsDefinitionLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const handleValidateWord = async () => {
    if (!word.trim()) {
      setError('Please enter a word to validate.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setResults(null);
    setDefinitions({});
    try {
      const validationResults = await geminiService.crossValidateWord(word.trim().toLowerCase());
      setResults(validationResults);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDefinition = async (wordToDefine: string, dictionaryName: string) => {
    setIsDefinitionLoading(prev => ({ ...prev, [dictionaryName]: true }));
    try {
        const definitionResult = await geminiService.getWordDefinition(wordToDefine, dictionaryName);
        setDefinitions(prev => ({ ...prev, [dictionaryName]: definitionResult }));
    } catch (err: any) {
        // Set an error state for this specific definition
        setDefinitions(prev => ({ ...prev, [dictionaryName]: { isValid: true, definition: 'Failed to fetch definition.' } }));
    } finally {
        setIsDefinitionLoading(prev => ({ ...prev, [dictionaryName]: false }));
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
        handleValidateWord();
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-amber-900 dark:text-amber-300 mb-4">Word Validator</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Cross-check word validity across the top 3 official Scrabble dictionaries.</p>
      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={word}
          onChange={(e) => {
             const sanitized = e.target.value.trim().split(' ')[0].replace(/[^a-zA-Z]/g, '');
             setWord(sanitized);
             setResults(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Enter a word..."
          className="flex-grow px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600"
        />
        <button
          onClick={handleValidateWord}
          disabled={isLoading}
          className="flex-shrink-0 flex justify-center items-center gap-2 bg-amber-700 text-white font-bold py-2 px-6 rounded-md hover:bg-amber-800 disabled:bg-amber-400 transition-colors duration-300 dark:bg-amber-600 dark:hover:bg-amber-700"
        >
          {isLoading ? <Spinner className="h-5 w-5 text-white" /> : 'Check'}
        </button>
      </div>

      {error && <div className="mt-4 text-center text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/50 p-3 rounded-md" role="alert" aria-live="polite">{error}</div>}

      {results && (
        <div className="mt-8 space-y-4" role="status" aria-live="polite">
          {results.map((result) => (
            <div key={result.dictionaryName} className={`p-4 rounded-lg border ${result.isValid ? 'bg-green-50/70 border-green-300 dark:bg-green-900/30 dark:border-green-700' : 'bg-red-50/70 border-red-300 dark:bg-red-900/30 dark:border-red-700'}`}>
              <div className="flex flex-col sm:flex-row sm:items-start sm:gap-4">
                <div className="flex-shrink-0 flex items-center gap-3 mb-2 sm:mb-0">
                  {result.isValid ? 
                    <CheckCircleIcon className="w-6 h-6 text-green-600" /> : 
                    <XCircleIcon className="w-6 h-6 text-red-600" />
                  }
                  <h3 className={`text-lg font-bold ${result.isValid ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}`}>
                    {result.dictionaryName}
                  </h3>
                </div>
                <div className="flex-grow sm:border-l sm:pl-4 border-gray-300/60 dark:border-gray-600">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{result.dictionaryDescription}</p>
                  <p className={`text-sm font-semibold ${result.isValid ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'}`}>
                    "{word}" is {result.isValid ? 'VALID' : 'NOT VALID'} in this dictionary.
                  </p>
                  
                  {result.isValid && (
                    <div className="mt-3">
                      {!definitions[result.dictionaryName] && (
                        <button 
                          onClick={() => handleGetDefinition(word.trim().toLowerCase(), result.dictionaryName)}
                          disabled={isDefinitionLoading[result.dictionaryName]}
                          className="text-sm bg-amber-600 text-white font-semibold py-1.5 px-3 rounded-md hover:bg-amber-700 disabled:bg-amber-400 transition-colors text-left flex items-center gap-1.5"
                        >
                          {isDefinitionLoading[result.dictionaryName] ? <Spinner className="h-4 w-4 text-white -ml-1 mr-1" /> : null}
                          Show Definition
                        </button>
                      )}
                      {definitions[result.dictionaryName] && (
                        <div className="text-sm text-gray-800 dark:text-gray-200 bg-amber-100/60 dark:bg-gray-700/50 p-3 rounded-md border border-amber-200/80 dark:border-gray-600 mt-2">
                          <p><strong>Definition:</strong> {definitions[result.dictionaryName].definition || 'No definition found for this dictionary.'}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WordValidator;