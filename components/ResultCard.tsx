
import React from 'react';
import { Spinner } from './Spinner';

interface ResultCardProps {
  title: string;
  text: string;
  isLoading?: boolean;
  placeholder?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  text,
  isLoading = false,
  placeholder = '...',
}) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 w-full h-64 flex flex-col shadow-lg">
      <h2 className="text-lg font-semibold text-teal-400 mb-4">{title}</h2>
      <div className="relative flex-grow overflow-y-auto">
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner />
          </div>
        ) : (
          <p className="text-gray-300 whitespace-pre-wrap">
            {text || <span className="text-gray-500">{placeholder}</span>}
          </p>
        )}
      </div>
    </div>
  );
};