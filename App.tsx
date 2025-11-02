
import React, { useState } from 'react';
import Header from './components/Header';
import Tabs from './components/Tabs';
import WordFinder from './components/WordFinder';
import WordValidator from './components/WordValidator';
import BoardAnalyzer from './components/BoardAnalyzer';
import AiChat from './components/AiChat';
import { AppView } from './types';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>(AppView.WordFinder);

  const renderActiveView = () => {
    switch (activeView) {
      case AppView.WordFinder:
        return <WordFinder />;
      case AppView.Validator:
        return <WordValidator />;
      case AppView.BoardAnalyzer:
        return <BoardAnalyzer />;
      case AppView.AIChat:
        return <AiChat />;
      default:
        return <WordFinder />;
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-800 bg-amber-50/50">
      <Header />
      <main className="max-w-4xl mx-auto p-4 sm:p-6 md:p-8">
        <Tabs activeView={activeView} setActiveView={setActiveView} />
        <div className="mt-6 bg-white rounded-xl shadow-lg overflow-hidden">
          {renderActiveView()}
        </div>
      </main>
      <footer className="text-center p-4 text-xs text-amber-700">
        <p>&copy; 2024 Scrabble Scholar. Enhance your game.</p>
      </footer>
    </div>
  );
};

export default App;
