import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light);
  };
  
  const getLabel = () => {
    return theme === Theme.Light ? "Switch to Dark Theme" : "Switch to Light Theme";
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-amber-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-800 dark:focus:ring-offset-gray-800/90 focus:ring-white transition-colors"
      aria-label={getLabel()}
    >
      {theme === Theme.Light ? <SunIcon className="w-5 h-5"/> : <MoonIcon className="w-5 h-5"/>}
    </button>
  );
};

export default ThemeToggle;