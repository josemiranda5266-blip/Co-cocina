import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Sparkles, Volume2 } from 'lucide-react';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceResult: (transcript: string) => void;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onVoiceResult
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setIsListening(false);
      setTranscript('');
      setErrorMsg('');
      return;
    }

    // Initialize Web Speech Recognition
    const windowWithSpeech = window as any;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMsg('Tu navegador no soporta búsqueda por voz directa. Podés escribir en el buscador principal.');
      return;
    }

    let recognition: any;
    try {
      recognition = new SpeechRecognition();
      recognition.lang = 'es-AR'; // Spanish Argentina / LatAm
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMsg('Permiso de micrófono denegado en tu navegador.');
        } else {
          setErrorMsg('No pudimos escuchar con claridad. Intenta hablar nuevamente.');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al iniciar el micrófono.');
    }

    return () => {
      if (recognition) {
        try { recognition.stop(); } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (transcript.trim()) {
      onVoiceResult(transcript);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 sm:p-8 text-center relative shadow-2xl border border-stone-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex p-3 bg-orange-100 text-orange-600 rounded-full mb-4">
          <Sparkles className="w-6 h-6" />
        </div>

        <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
          Búsqueda por Voz
        </h2>

        <p className="text-stone-600 text-sm mb-6">
          Decí algo como: <em className="text-orange-700 font-medium">"Quiero cocinar algo con pollo que sea rápido y fácil"</em>
        </p>

        {/* Pulse Microphone Ring */}
        <div className="my-8 flex justify-center">
          <div className="relative">
            {isListening && (
              <div className="absolute -inset-4 rounded-full bg-orange-500/20 animate-ping" />
            )}
            <div className={`w-24 h-24 rounded-full flex items-center justify-center text-white transition-all shadow-xl ${
              isListening ? 'bg-orange-600 scale-110' : 'bg-stone-400'
            }`}>
              <Mic className="w-10 h-10" />
            </div>
          </div>
        </div>

        {/* Transcript Box */}
        <div className="min-h-16 p-4 bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-center text-stone-800 text-base font-semibold mb-6">
          {transcript ? (
            <span>"{transcript}"</span>
          ) : isListening ? (
            <span className="text-orange-600 text-sm animate-pulse">Escuchando tu voz...</span>
          ) : (
            <span className="text-stone-400 text-sm italic">Presiona buscar cuando estés listo</span>
          )}
        </div>

        {errorMsg && (
          <p className="text-xs text-rose-600 mb-4">{errorMsg}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-sm rounded-xl transition-colors"
          >
            Cancelar
          </button>
          
          <button
            onClick={handleConfirm}
            disabled={!transcript.trim()}
            className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
          >
            Buscar
          </button>
        </div>

      </div>
    </div>
  );
};
