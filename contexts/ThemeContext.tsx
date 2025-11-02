import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as Theme;
      // If a valid theme is saved in localStorage, use it.
      if (savedTheme === Theme.Light || savedTheme === Theme.Dark) {
        return savedTheme;
      }
      // Otherwise, use the system preference as the initial default.
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return Theme.Dark;
      }
    }
    // Fallback to light theme.
    return Theme.Light;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Set class and local storage based on the current theme.
    root.classList.toggle('dark', theme === Theme.Dark);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};