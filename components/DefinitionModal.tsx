import React from 'react';
import { WordValidationResult } from '../types';
import Spinner from './Spinner';

interface DefinitionModalProps {
  word: string;
  definitionResult: WordValidationResult | null;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}

const DefinitionModal: React.FC<DefinitionModalProps> = ({ word, definitionResult, isLoading, error, onClose }) => {
  // Handle Escape key to close modal
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 transition-opacity duration-300"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="definition-title"
    >
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full"
          aria-label="Close definition modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <h3 id="definition-title" className="text-2xl font-bold text-amber-900 mb-4 capitalize">
          {word}
        </h3>
        <div className="min-h-[100px] flex flex-col justify-center">
          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Spinner className="h-8 w-8 text-amber-700" />
            </div>
          )}
          {error && (
            <div className="text-center text-red-600 bg-red-100 p-3 rounded-md">{error}</div>
          )}
          {definitionResult && (
            <div>
              {definitionResult.isValid && definitionResult.definition ? (
                <>
                  <p className="text-sm text-green-700 font-semibold mb-2">Scrabble-Valid Word</p>
                  <p className="text-gray-700">{definitionResult.definition}</p>
                </>
              ) : (
                <p className="text-red-700">This word is not valid or has no definition in the dictionary.</p>
              )}
            </div>
          )}
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default DefinitionModal;
