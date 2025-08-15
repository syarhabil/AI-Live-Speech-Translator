
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">
        AI Live Speech Translator
      </h1>
      <p className="text-gray-400 mt-2 text-lg">
        Speak freely. Understand instantly.
      </p>
    </header>
  );
};