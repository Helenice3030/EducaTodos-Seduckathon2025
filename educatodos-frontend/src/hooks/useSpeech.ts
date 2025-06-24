import { useCallback, useEffect, useState } from "react";

export const useSpeech = () => {
  const synth = window.speechSynthesis;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentUtterance, setCurrentUtterance] = useState(null);

  const speak = useCallback((text) => {
    if (synth.speaking) {
      synth.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    synth.speak(utterance);
    setCurrentUtterance(utterance);
  }, [synth]);

  const pause = useCallback(() => {
    if (synth.speaking && !synth.paused) {
      synth.pause();
      setIsPaused(true);
    }
  }, [synth]);

  const resume = useCallback(() => {
    if (synth.paused) {
      synth.resume();
      setIsPaused(false);
    }
  }, [synth]);

  const cancel = useCallback(() => {
    synth.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  }, [synth]);

  useEffect(() => {
    return () => {
      synth.cancel();
    };
  }, [synth]);

  return {
    speak,
    pause,
    resume,
    cancel,
    isSpeaking,
    isPaused,
  };
};