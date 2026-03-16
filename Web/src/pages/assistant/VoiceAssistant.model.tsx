import { useEffect, useMemo, useRef, useState } from "react";
import type { VoiceAssistantViewModel } from "@components/VoiceAssistant";
import AssistantPage, {
  AssistantPageHandle,
} from "@features/assistant/components/AssistantPage";
import { getAssistantMicrophoneMode, getAssistantMode } from "@features/assistant/preferences";

export function useVoiceAssistantModel(): VoiceAssistantViewModel {
  const runtimeRef = useRef<AssistantPageHandle | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [shouldStartAfterMount, setShouldStartAfterMount] = useState(false);
  const [shouldPressStartAfterMount, setShouldPressStartAfterMount] = useState(false);

  useEffect(() => {
    if (!hasSession || !shouldStartAfterMount || !runtimeRef.current) {
      return;
    }

    runtimeRef.current.startListening();
    setShouldStartAfterMount(false);
  }, [hasSession, shouldStartAfterMount]);

  useEffect(() => {
    if (!hasSession || !shouldPressStartAfterMount || !runtimeRef.current) {
      return;
    }

    runtimeRef.current.startPressListening?.();
    setShouldPressStartAfterMount(false);
  }, [hasSession, shouldPressStartAfterMount]);

  const overlay = useMemo(() => {
    if (!hasSession) {
      return null;
    }

    return (
      <AssistantPage
        ref={runtimeRef}
        compact
        showTrigger={false}
        onListeningChange={setIsListening}
      />
    );
  }, [hasSession]);

  return {
    isVisible: true,
    isListening,
    hasSession,
    closeLabel: Lang.assistant.voiceOverlay.closeLabel,
    onToggleMicrophone: () => {
      if (getAssistantMode() === "manual" && getAssistantMicrophoneMode() === "hold") {
        return;
      }

      if (!hasSession) {
        setHasSession(true);
        setShouldStartAfterMount(true);
        return;
      }

      runtimeRef.current?.toggleListening();
    },
    onMicrophonePressStart: () => {
      if (getAssistantMode() !== "manual" || getAssistantMicrophoneMode() !== "hold") {
        return;
      }

      if (!hasSession) {
        setHasSession(true);
        setShouldStartAfterMount(false);
        setShouldPressStartAfterMount(true);
        return;
      }

      runtimeRef.current?.startPressListening?.();
    },
    onMicrophonePressEnd: () => {
      if (getAssistantMode() !== "manual" || getAssistantMicrophoneMode() !== "hold") {
        return;
      }

      runtimeRef.current?.endPressListening?.();
    },
    onClose: () => {
      runtimeRef.current?.stopListening();
      setIsListening(false);
      setShouldStartAfterMount(false);
      setShouldPressStartAfterMount(false);
      setHasSession(false);
    },
    overlay,
  };
}
