import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Theme } from '../types';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') {
      return Theme.Light;
    }
    const savedTheme = localStorage.getItem('theme') as Theme;
    if (savedTheme === Theme.Light || savedTheme === Theme.Dark) {
      return savedTheme;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? Theme.Dark : Theme.Light;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    
    if (theme === Theme.Dark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('theme', theme);
  }, [theme]);
  
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