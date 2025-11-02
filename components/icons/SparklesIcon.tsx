
import React from 'react';

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.256 9A1 1 0 0117 10.744l-2.47 1.134L13.033 16a1 1 0 01-1.933 0l-1.553-4.122-2.47-1.134A1 1 0 018 9.256L10.854 7.2 12.033 3A1 1 0 0112 2z" clipRule="evenodd" />
  </svg>
);
