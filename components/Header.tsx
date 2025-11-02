import React from 'react';
import ThemeToggle from './ThemeToggle';

const Header: React.FC = () => {
  return (
    <header className="bg-amber-800 dark:bg-gray-800/90 text-white shadow-md p-4 sm:p-6">
      <div className="max-w-4xl mx-auto flex justify-between items-center relative">
        <div className="text-center flex-grow">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
            Scrabble Scholar
          </h1>
          <p className="text-amber-200 dark:text-gray-400 mt-1 text-sm sm:text-base">Your AI Companion for the Classic Word Game</p>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 sm:static sm:translate-y-0 sm:right-auto sm:top-auto">
            <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;