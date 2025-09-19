import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import AIMicrophone, {
  startListening,
  stopListening,
  type AIMicrophoneProps,
} from "@components/voice/AIMicrophone";
import type { AIItemData } from "@features/speech/AIParserManager";
import Metric from "@features/tabs/resourceUsage/Metric";
import {
  getCurrentCosts,
  ResourceUseChannel,
  type AIUse,
} from "@resourceUse";
import getRepositories from "@repositories";

import AssistantController, { ASSISTANT_MODEL } from "../AssistantController";
import { AssistantMicrophoneAdapter } from "../microphoneAdapter";
import type { AssistantToolCallLog } from "../types";
import ToolCallLogList from "./ToolCallLogList";

import "./AssistantPage.css";

export default function AssistantPage() {
  const [calls, setCalls] = useState<AssistantToolCallLog[]>([]);
  const [askUserPrompt, setAskUserPrompt] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const pendingAskResolver = useRef<((answer: string) => void) | null>(null);
  const resourcesUse = useMemo(() => getRepositories().resourcesUse, []);

  const normalizeUsage = useCallback(
    (usage?: AIUse<number> | null) => ({
      requests: usage?.requests ?? 0,
      input: usage?.input ?? 0,
      output: usage?.output ?? 0,
    }),
    []
  );

  useEffect(() => {
    resourcesUse.clearSessionUse();
  }, [normalizeUsage, resourcesUse]);

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

  const formattedCalls = useMemo(() => [...calls].reverse(), [calls]);

  const modelUsage = normalizeUsage(resourcesUse.sessionUse.ai?.[ASSISTANT_MODEL]);
  const totalTokens = modelUsage.input + modelUsage.output;
  const assistantCosts = useMemo(
    () =>
      getCurrentCosts({
        [ASSISTANT_MODEL]: modelUsage as AIUse<number>,
      }),
    [modelUsage]
  );

  return (
    <div className="assistant-page">
      <div className="assistant-page__microphone">
        <AIMicrophone parser={microphoneParser} />
      </div>
      <div className="assistant-page__content">
        <section className="assistant-section assistant-section--usage">
          <div className="assistant-usage__header">
            <h2>Uso de Tokens</h2>
            <span className="assistant-usage__model">Modelo {ASSISTANT_MODEL}</span>
          </div>
          <div className="assistant-usage__metrics">
            <Metric label="Requisições" value={modelUsage.requests} />
            <Metric label="Tokens de Entrada" value={modelUsage.input} />
            <Metric label="Tokens de Saída" value={modelUsage.output} />
            <Metric label="Tokens Totais" value={totalTokens} />
            <Metric
              label="Custo Estimado (USD)"
              value={`US$ ${assistantCosts.dolars.toFixed(4)}`}
            />
          </div>
        </section>
        {askUserPrompt && (
          <section className="assistant-section assistant-section--highlight">
            <h2>Pergunta para o usuário</h2>
            <pre className="assistant-ask-user__message">{askUserPrompt}</pre>
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
          <ToolCallLogList calls={formattedCalls} />
        </section>
      </div>
    </div>
  );
}
