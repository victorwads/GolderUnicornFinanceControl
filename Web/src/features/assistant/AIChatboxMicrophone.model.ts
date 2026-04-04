import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useSpeechRecognition } from "react-speech-recognition";

import { startListening as startSpeechListening, stopListening as stopSpeechListening } from "../../components/voice/microfone";
import { getAssistantMode } from "./preferences";

const AUTO_SEND_TIMEOUT = 2000;
const TIMERS = {
  autoLastUpdate: null as Date | null
}

type Params = {
  draft: string;
  penddingAnswer: boolean;
  setDraft: Dispatch<SetStateAction<string>>;
  onAutoSend: () => void;
};

export function useAIChatboxMicrophoneModel({ 
  draft, setDraft, onAutoSend, penddingAnswer
}: Params) {
  const { transcript, interimTranscript, finalTranscript, resetTranscript, listening } = useSpeechRecognition();
  const [ autoSendProgress, setAutoSendProgress ] = useState(0);

  const clearAutoSend = () => {
    setAutoSendProgress(0);
    TIMERS.autoLastUpdate = null;
  };

  const autoSend = () => {
    resetTranscript();
    clearAutoSend();
    onAutoSend();
  }

  useEffect(() => {
    if (getAssistantMode() !== 'live' || !listening || draft.trim() === '') {
      clearAutoSend();
      return;
    }
    TIMERS.autoLastUpdate = new Date();

    const timer = setInterval(() => {
      const diff = new Date().getTime() - (TIMERS.autoLastUpdate?.getTime() || 0);
      if (diff < AUTO_SEND_TIMEOUT) {
        setAutoSendProgress(diff / AUTO_SEND_TIMEOUT * 100);
        return;
      } else autoSend();
    }, 100);

    return () => {
      clearInterval(timer);
    }
  }, [draft, listening]);

  useEffect(() => {
    console.log('Transcript updated:', {
      transcript, interimTranscript, finalTranscript,
      listening, draft,
    });
    setDraft(transcript)
  }, [transcript, interimTranscript, finalTranscript, listening]);

  useEffect(() => {
    if (getAssistantMode() !== 'live') return;
    if(penddingAnswer && !listening) {
      startSpeechListening();
    }
  }, [penddingAnswer, listening]);

  return {
    isListening: listening,
    autoSendProgress,
    setAutoSendProgress,
    clearAutoSend,
    toggleMic: () => {
      if (listening) stopSpeechListening(); else startSpeechListening();
    },
    stopMic: () => stopSpeechListening()
  };
}

function buildDraftWithTranscript(baseDraft: string, transcript: string): string {
  const nextTranscript = transcript.trim();
  const nextBase = baseDraft.trimEnd();

  if (!nextTranscript) {
    return nextBase;
  }

  if (!nextBase) {
    return nextTranscript;
  }

  return `${nextBase} ${nextTranscript}`;
}
