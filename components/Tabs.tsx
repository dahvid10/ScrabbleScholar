
import React from 'react';
import { AppView } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';
import { SearchIcon } from './icons/SearchIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UploadIcon } from './icons/UploadIcon';
import { ChatIcon } from './icons/ChatIcon';

interface TabsProps {
  activeView: AppView;
  setActiveView: (view: AppView) => void;
}

const tabOptions = [
  { view: AppView.WordFinder, icon: <SearchIcon /> },
  { view: AppView.Validator, icon: <CheckCircleIcon /> },
  { view: AppView.BoardAnalyzer, icon: <UploadIcon /> },
  { view: AppView.AIChat, icon: <ChatIcon /> },
];

const Tabs: React.FC<TabsProps> = ({ activeView, setActiveView }) => {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-2 bg-amber-200/50 rounded-full">
      {tabOptions.map(({ view, icon }) => (
        <button
          key={view}
          onClick={() => setActiveView(view)}
          className={`
            flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-semibold rounded-full transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-600
            ${
              activeView === view
                ? 'bg-amber-800 text-white shadow-md'
                : 'bg-white text-amber-800 hover:bg-amber-100'
            }
          `}
        >
          {icon}
          {view}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
