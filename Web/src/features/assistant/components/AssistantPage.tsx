import { useCallback, useMemo, useRef, useState } from "react";

import AIMicrophone, {
  startListening,
  stopListening,
  type AIMicrophoneProps,
} from "@components/voice/AIMicrophone";
import type { AIItemData } from "@features/speech/AIParserManager";

import AssistantController from "../AssistantController";
import { AssistantMicrophoneAdapter } from "../microphoneAdapter";
import type { AssistantToolCallLog } from "../types";
import ToolCallLogList from "./ToolCallLogList";

import "./AssistantPage.css";

export default function AssistantPage() {
  const [calls, setCalls] = useState<AssistantToolCallLog[]>([]);
  const [askUserPrompt, setAskUserPrompt] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const pendingAskResolver = useRef<((answer: string) => void) | null>(null);

  const handleToolCall = useCallback((event: AssistantToolCallLog) => {
    setCalls((previous) => [...previous, event]);
  }, []);

  const handleAskAdditionalInfo = useCallback((message: string) => {
    setAskUserPrompt(message);
    startListening();

    return new Promise<string>((resolve) => {
      pendingAskResolver.current = (answer: string) => {
        pendingAskResolver.current = null;
        setAskUserPrompt(null);
        resolve(answer);
      };
    });
  }, []);

  const controller = useMemo(
    () =>
      new AssistantController(
        undefined,
        handleAskAdditionalInfo,
        handleToolCall
      ),
    [handleAskAdditionalInfo, handleToolCall]
  );

  const processText = useCallback(
    async (text: string, userLanguage: string) => {
      stopListening();
      if (pendingAskResolver.current) {
        pendingAskResolver.current(text);
        return;
      }

      controller.run(text, userLanguage).then((result) => {
        if (result.warnings.length) {
          setWarnings((previous) => [...previous, ...result.warnings]);
        }
      });
    },
    [controller]
  );

  const parser = useMemo(
    () => new AssistantMicrophoneAdapter(processText),
    [processText]
  );
  const microphoneParser = parser as unknown as AIMicrophoneProps<
    AIItemData,
    string
  >["parser"];

  return (
    <div className="assistant-page">
      <div className="assistant-page__microphone">
        <AIMicrophone parser={microphoneParser} />
      </div>
      <div className="assistant-page__content">
        {askUserPrompt && (
          <section className="assistant-section assistant-section--highlight">
            <h2>Pergunta para o usuário</h2>
            <p className="assistant-ask-user__message">{askUserPrompt}</p>
            <p className="assistant-ask-user__hint">
              Responda pelo microfone para continuar.
            </p>
          </section>
        )}
        {warnings.length > 0 && (
          <section className="assistant-section assistant-section--warnings">
            <h2>
              Avisos <button onClick={() => setWarnings([])}>Limpar</button>
            </h2>
            <ul>
              {warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </section>
        )}
        <section className="assistant-section">
          <h2>Calls History</h2>
          <ToolCallLogList calls={calls.reverse()} />
        </section>
      </div>
    </div>
  );
}
