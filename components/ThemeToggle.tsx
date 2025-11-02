import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Theme } from '../types';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const isDark = theme === Theme.Dark;

  const toggleTheme = () => {
    setTheme(isDark ? Theme.Light : Theme.Dark);
  };
  
  // The icon now represents the theme that will be activated on click,
  // making the action clearer to the user. In light mode, a moon is shown
  // to indicate a switch to dark, and vice-versa.
  const label = isDark ? "Switch to Light Theme" : "Switch to Dark Theme";
  const icon = isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />;

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full text-amber-200 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-amber-800 dark:focus:ring-offset-gray-800/90 focus:ring-white transition-colors"
      aria-label={label}
    >
      {icon}
    </button>
  );
};

export default ThemeToggle;