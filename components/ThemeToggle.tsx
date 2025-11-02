import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { SystemIcon } from './icons/SystemIcon';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    const themes = [Theme.System, Theme.Light, Theme.Dark];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };
  
  const getIcon = () => {
      switch(theme) {
          case Theme.Light:
              return <SunIcon className="w-5 h-5"/>;
          case Theme.Dark:
              return <MoonIcon className="w-5 h-5"/>;
          case Theme.System:
          default:
              return <SystemIcon className="w-5 h-5"/>;
      }
  }
  
  const getLabel = () => {
      switch(theme) {
          case Theme.Light: return "Switch to Dark Theme";
          case Theme.Dark: return "Switch to System Theme";
          case Theme.System: return "Switch to Light Theme";
      }
  }

  return (
    <button
      onClick={cycleTheme}
      className="p-2 rounded-full text-amber-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-800 dark:focus:ring-offset-gray-800/90 focus:ring-white transition-colors"
      aria-label={getLabel()}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;