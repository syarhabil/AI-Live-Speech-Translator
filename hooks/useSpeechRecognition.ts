import { useState, useEffect, useRef, useCallback } from 'react';

// Type definitions for the Web Speech API to resolve TypeScript errors in environments
// where they are not available by default (e.g., standard TS DOM lib).
// Based on: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

type SpeechRecognitionErrorCode =
  | 'no-speech'
  | 'aborted'
  | 'audio-capture'
  | 'network'
  | 'not-allowed'
  | 'service-not-allowed'
  | 'bad-grammar'
  | 'language-not-supported';

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: SpeechRecognitionErrorCode;
  readonly message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  grammars: any; // SpeechGrammarList is complex, 'any' is sufficient here for this use case
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  onaudiostart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onaudioend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onnomatch: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  onsoundstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onsoundend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onspeechend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  abort(): void;
  start(): void;
  stop(): void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

// Augment the global Window interface to make TypeScript aware of the SpeechRecognition APIs
declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}


interface SpeechRecognitionOptions {
  lang?: string;
}

const getSpeechRecognition = (): SpeechRecognitionStatic | null => {
  if (typeof window !== 'undefined') {
    return window.SpeechRecognition || window.webkitSpeechRecognition || null;
  }
  return null;
};

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [error, setError] = useState('');

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = getSpeechRecognition();
    if (!SpeechRecognitionAPI) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognitionRef.current = recognition;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          currentInterim += event.results[i][0].transcript;
        }
      }
      setInterimTranscript(currentInterim);
      if (finalTranscript) {
         setTranscript(prev => prev ? `${prev} ${finalTranscript.trim()}` : finalTranscript.trim());
         setInterimTranscript('');
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let friendlyError = '';
      switch (event.error) {
        case 'no-speech':
          friendlyError = "We didn't catch that. Please try speaking again.";
          break;
        case 'audio-capture':
          friendlyError = "There's an issue with your microphone. Please check your connection and try again.";
          break;
        case 'not-allowed':
        case 'service-not-allowed':
          friendlyError = "Microphone access denied. Please enable microphone permissions in your browser's settings for this site.";
          break;
        case 'network':
          friendlyError = "The speech service timed out. This may be a temporary issue. Please try again.";
          break;
        case 'language-not-supported':
          friendlyError = "The selected language isn't supported by your browser's speech recognition service.";
          break;
        case 'aborted':
          // This error is often triggered by the user stopping the recording intentionally.
          // We'll let the onend event handle the state change without showing an error message.
          break;
        default:
          friendlyError = "An unknown speech recognition error occurred. Please try again.";
          break;
      }
      
      if (friendlyError) {
        setError(friendlyError);
      }
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
    
    return () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
        }
    };
  }, []);

  const startListening = useCallback((options: SpeechRecognitionOptions = {}) => {
    if (recognitionRef.current && !isListening) {
      try {
        setTranscript('');
        setInterimTranscript('');
        setError('');
        recognitionRef.current.lang = options.lang || 'en-US';
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Error starting speech recognition:", err);
        let message = "Could not start listening. Please try again.";

        if (err instanceof DOMException) {
            if (err.name === 'NotAllowedError' || err.name === 'SecurityError') {
                message = "Microphone access denied. Please enable microphone permissions in your browser's settings for this site.";
            } else if (err.name === 'InvalidStateError') {
                // This can happen if start() is called when it's already started.
                // The isListening check should prevent this, but it's good to handle.
                message = "Speech recognition is already active. Please wait.";
            }
        }
        
        setError(message);
        setIsListening(false); // Ensure listening state is correctly reset
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return { isListening, transcript, interimTranscript, error, startListening, stopListening };
};