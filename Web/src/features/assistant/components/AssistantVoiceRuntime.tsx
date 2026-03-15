import { forwardRef, useImperativeHandle, useRef } from "react";
import AssistantPage, { AssistantPageHandle } from "./AssistantPage";

export interface AssistantVoiceRuntimeHandle {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

interface AssistantVoiceRuntimeProps {
  onListeningChange?: (listening: boolean) => void;
}

const AssistantVoiceRuntime = forwardRef<AssistantVoiceRuntimeHandle, AssistantVoiceRuntimeProps>(
  function AssistantVoiceRuntime({ onListeningChange }, ref) {
    const pageHandle = useRef<AssistantPageHandle | null>(null);

    useImperativeHandle(ref, () => ({
      startListening: () => pageHandle.current?.startListening(),
      stopListening: () => pageHandle.current?.stopListening(),
      toggleListening: () => pageHandle.current?.toggleListening(),
    }), []);

    return (
      <AssistantPage
        ref={pageHandle}
        compact
        showTrigger={false}
        onListeningChange={onListeningChange}
      />
    );
  },
);

export default AssistantVoiceRuntime;
