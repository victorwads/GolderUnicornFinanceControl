import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useSpeechRecognition } from "react-speech-recognition";

import { startListening as startSpeechListening, stopListening as stopSpeechListening } from "../../components/voice/microfone";
import { getAssistantMicrophoneMode } from "./preferences";

const AUTO_SEND_TIMEOUT = 2500;
const TIMERS = {
  autoLastUpdate: null as Date | null
}

type Params = {
  draft: string;
  processing: boolean;
  setDraft: Dispatch<SetStateAction<string>>;
  onAutoSend: () => void;
};

export function useAIChatboxMicrophoneModel({ 
  draft, setDraft, onAutoSend, processing
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

  // Auto send when user stops talking for a certain time
  useEffect(() => {
    if (getAssistantMicrophoneMode() !== 'live' || !listening || draft.trim() === '') {
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

  // Auto start listening when assistant is open and waiting for answer
  useEffect(() => {
    if (getAssistantMicrophoneMode() !== 'live') return;
    if(processing && !listening) startSpeechListening();
  }, [processing, listening]);

  useEffect(() => {
    // TODO: handle interim transcript better, maybe show it in the UI with a different style
    // Need to merge interimTranscript and finalTranscript in a better way,
    // no lose the draft manually typed when finalTranscript is updated
    console.log('Transcript updated:', {
      transcript, interimTranscript, finalTranscript,
      listening, draft,
    });
    setDraft(transcript)
  }, [transcript, interimTranscript, finalTranscript, listening]);

  return {
    isListening: listening,
    autoSendProgress,
    setAutoSendProgress,
    clearAutoSend,
    startMicIfLive: () => {
      if (getAssistantMicrophoneMode() !== "live" || listening) return;
      startSpeechListening();
    },
    toggleMic: () => {
      if (getAssistantMicrophoneMode() === "hold") return;
      if (listening) {
        stopSpeechListening();
        if (getAssistantMicrophoneMode() === "click") autoSend();
      } else startSpeechListening();
    },
    startPressMic: () => {
      if (getAssistantMicrophoneMode() !== "hold") return;
      startSpeechListening();
    },
    endPressMic: () => {
      if (getAssistantMicrophoneMode() !== "hold") return;
      stopSpeechListening();
      autoSend();
    },
    stopMic: () => stopSpeechListening()
  };
}
