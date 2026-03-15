import { useEffect, useMemo, useRef, useState } from "react";
import type { VoiceAssistantViewModel } from "@components/VoiceAssistant";
import AssistantVoiceRuntime, {
  AssistantVoiceRuntimeHandle,
} from "@features/assistant/components/AssistantVoiceRuntime";

export function useVoiceAssistantModel(): VoiceAssistantViewModel {
  const runtimeRef = useRef<AssistantVoiceRuntimeHandle | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [shouldStartAfterMount, setShouldStartAfterMount] = useState(false);

  useEffect(() => {
    if (!hasSession || !shouldStartAfterMount || !runtimeRef.current) {
      return;
    }

    runtimeRef.current.startListening();
    setShouldStartAfterMount(false);
  }, [hasSession, shouldStartAfterMount]);

  const overlay = useMemo(() => {
    if (!hasSession) {
      return null;
    }

    return (
      <AssistantVoiceRuntime
        ref={runtimeRef}
        onListeningChange={setIsListening}
      />
    );
  }, [hasSession]);

  return {
    isVisible: true,
    isListening,
    hasSession,
    closeLabel: Lang.aiMic.onboarding.actions.close,
    onToggleMicrophone: () => {
      if (!hasSession) {
        setHasSession(true);
        setShouldStartAfterMount(true);
        return;
      }

      runtimeRef.current?.toggleListening();
    },
    onClose: () => {
      runtimeRef.current?.stopListening();
      setIsListening(false);
      setShouldStartAfterMount(false);
      setHasSession(false);
    },
    overlay,
  };
}
