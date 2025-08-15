
import React, { useState, useEffect, useCallback } from 'react';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { translateText } from './services/geminiService';
import { Header } from './components/Header';
import { LanguageSelector } from './components/LanguageSelector';
import { ResultCard } from './components/ResultCard';
import { MicrophoneIcon } from './components/MicrophoneIcon';
import { SUPPORTED_LANGUAGES } from './constants';

const App: React.FC = () => {
  const [sourceLang, setSourceLang] = useState<string>('English');
  const [targetLang, setTargetLang] = useState<string>('Spanish');
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [error, setError] = useState<{ message: string; onRetry?: () => void } | null>(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    error: recognitionError
  } = useSpeechRecognition();

  const handleTranslate = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setIsTranslating(true);
    setError(null);
    setTranslatedText('');
    try {
      const result = await translateText(text, sourceLang, targetLang);
      setTranslatedText(result);
    } catch (err) {
      setError({
        message: 'Translation failed. Please try again.',
        onRetry: () => handleTranslate(text),
      });
      console.error(err);
    } finally {
      setIsTranslating(false);
    }
  }, [sourceLang, targetLang]);

  const handleStartListening = useCallback(() => {
    setError(null);
    setTranslatedText('');
    startListening({ lang: SUPPORTED_LANGUAGES.find(l => l.name === sourceLang)?.code || 'en-US' });
  }, [sourceLang, startListening]);

  useEffect(() => {
    if (transcript) {
      handleTranslate(transcript);
    }
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]);

  useEffect(() => {
    if(recognitionError) {
      setError({
        message: recognitionError,
        onRetry: handleStartListening,
      });
    }
  }, [recognitionError, handleStartListening]);

  const handleMicClick = () => {
    if (isListening) {
      stopListening();
    } else {
      handleStartListening();
    }
  };
  
  const swapLanguages = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
    setTranslatedText('');
    setError(null);
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans flex flex-col items-center p-4 sm:p-6 md:p-8">
      <Header />
      <main className="w-full max-w-4xl flex flex-col items-center gap-6 mt-8">
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4">
          <LanguageSelector
            label="From"
            selectedLanguage={sourceLang}
            onLanguageChange={(lang) => { setSourceLang(lang); setError(null); }}
          />
          <button 
            onClick={swapLanguages} 
            className="p-2 rounded-full bg-gray-700 hover:bg-teal-500 transition-colors duration-200 text-gray-200"
            aria-label="Swap languages"
          >
            <i className="fas fa-exchange-alt"></i>
          </button>
          <LanguageSelector
            label="To"
            selectedLanguage={targetLang}
            onLanguageChange={(lang) => { setTargetLang(lang); setError(null); }}
          />
        </div>

        <div className="relative my-6">
          <button
            onClick={handleMicClick}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-red-600 shadow-[0_0_20px_4px_rgba(239,68,68,0.7)]'
                : 'bg-teal-500 hover:bg-teal-400 shadow-[0_0_20px_4px_rgba(20,184,166,0.5)]'
            }`}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
          >
            <MicrophoneIcon isListening={isListening} />
          </button>
        </div>

        {error && (
          <div className="w-full max-w-2xl bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md flex items-center justify-between gap-4">
            <span className="text-left">{error.message}</span>
            {error.onRetry && (
              <button
                onClick={error.onRetry}
                className="bg-red-700 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded transition-colors duration-200 whitespace-nowrap text-sm"
                aria-label="Try again"
              >
                Try Again
              </button>
            )}
          </div>
        )}

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          <ResultCard
            title={sourceLang}
            text={transcript || interimTranscript}
            placeholder="Your transcribed text will appear here..."
          />
          <ResultCard
            title={targetLang}
            text={translatedText}
            isLoading={isTranslating}
            placeholder="Translation will appear here..."
          />
        </div>
      </main>
       <footer className="text-center text-gray-500 mt-12 text-sm">
        <p>Powered by Google Gemini API & Browser Speech Recognition</p>
      </footer>
    </div>
  );
};

export default App;
