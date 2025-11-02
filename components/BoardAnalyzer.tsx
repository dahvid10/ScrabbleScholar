
import React, { useState, useCallback } from 'react';
import * as geminiService from '../services/geminiService';
import Spinner from './Spinner';
import { UploadIcon } from './icons/UploadIcon';

const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const processLine = (line: string): string => {
        if (line.startsWith('### ')) return `<h3>${line.substring(4)}</h3>`;
        if (line.startsWith('## ')) return `<h2>${line.substring(3)}</h2>`;
        if (line.startsWith('# ')) return `<h1>${line.substring(2)}</h1>`;
        
        line = line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        if (line.trim().startsWith('* ')) return `<li>${line.trim().substring(2)}</li>`;
        
        if (line.trim()) return `<p>${line.trim()}</p>`;

        return '';
    };
    
    const lines = content.split('\n');
    let html = '';
    let inList = false;

    for (const line of lines) {
        const trimmedLine = line.trim();
        const isListItem = trimmedLine.startsWith('* ');

        if (isListItem && !inList) {
            html += '<ul>';
            inList = true;
        } else if (!isListItem && inList) {
            html += '</ul>';
            inList = false;
        }
        
        html += processLine(line);
    }

    if (inList) {
        html += '</ul>';
    }

    return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
};

const MAX_FILE_SIZE_MB = 10;
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_LETTERS_LENGTH = 15;

const BoardAnalyzer: React.FC = () => {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [userLetters, setUserLetters] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setError(`Invalid file type. Please upload a PNG, JPG, GIF, or WebP file.`);
        return;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File is too large. Please upload an image under ${MAX_FILE_SIZE_MB}MB.`);
        return;
      }

      setError(null);
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) {
      setError('Please upload an image of the board.');
      return;
    }
    if (!userLetters.trim()) {
      setError('Please enter your current letters.');
      return;
    }
     if (userLetters.trim().length > MAX_LETTERS_LENGTH) {
      setError(`Please enter no more than ${MAX_LETTERS_LENGTH} letters.`);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const imagePart = await fileToGenerativePart(imageFile);
      const analysis = await geminiService.analyzeBoard(imagePart, userLetters);
      setResult(analysis);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <h2 className="text-2xl font-bold text-amber-900 mb-4">Board Analyzer</h2>
      <p className="text-gray-600 mb-6">Upload a photo of your Scrabble board and enter your letters to get strategic move suggestions from our AI grandmaster.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label htmlFor="board-upload" className="block text-sm font-medium text-gray-700 mb-1">Board Image</label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <img src={imagePreview} alt="Scrabble board preview" className="mx-auto h-32 w-auto object-contain rounded-md" />
              ) : (
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              )}
              <div className="flex text-sm text-gray-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleFileChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
            </div>
          </div>
        </div>
        <div>
          <label htmlFor="user-letters" className="block text-sm font-medium text-gray-700 mb-1">Your Letters</label>
          <input
            id="user-letters"
            type="text"
            value={userLetters}
            onChange={(e) => setUserLetters(e.target.value.replace(/[^a-zA-Z]/g, ''))}
            maxLength={MAX_LETTERS_LENGTH}
            placeholder="e.g., AEILNOR"
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>
      
      <button
        onClick={handleAnalyze}
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-amber-700 text-white font-bold py-3 px-4 rounded-md hover:bg-amber-800 disabled:bg-amber-400 transition-colors duration-300"
      >
        {isLoading ? <><Spinner /> Analyzing...</> : 'Analyze Board'}
      </button>

      {error && <div className="mt-4 text-center text-red-600 bg-red-100 p-3 rounded-md" role="alert" aria-live="polite">{error}</div>}

      {result && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg border" aria-live="polite">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">AI Suggestions:</h3>
            <div className="space-y-4 text-gray-700">
               {result.trim() ? <MarkdownRenderer content={result} /> : <p>The AI could not find any suggestions for the provided board and letters.</p>}
            </div>
        </div>
      )}
    </div>
  );
};

export default BoardAnalyzer;