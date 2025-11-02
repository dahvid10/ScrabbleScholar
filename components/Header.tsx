
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-amber-800 text-white shadow-md p-4 sm:p-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-wider" style={{ fontFamily: 'Georgia, serif' }}>
          Scrabble Scholar
        </h1>
        <p className="text-amber-200 mt-1 text-sm sm:text-base">Your AI Companion for the Classic Word Game</p>
      </div>
    </header>
  );
};

export default Header;
