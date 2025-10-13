import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AIMicrophone, { type AIMicrophoneProps } from "@components/voice/AIMicrophone";
import type { AIItemData } from "@features/speech/AIParserManager";
import Metric from "@features/tabs/resourceUsage/Metric";
import getRepositories from "@repositories";

import AssistantController, { ASSISTANT_MODEL } from "../AssistantController";
import { AssistantMicrophoneAdapter } from "../microphoneAdapter";
import type { AssistantToolCallLog } from "../tools/types";
import ToolCallLogList from "./ToolCallLogList";

import "./AssistantPage.css";
import Icon, { Icons } from "@components/Icons";
import GlassContainer from "@components/GlassContainer";
import { startListening, stopListening } from "@components/voice/microfone";
import { AiCallContext, AIUse } from "@models";
import { speak } from "@features/tabs/settings/sections/VoicePreferencesSection";

export default function AssistantPage({
  compact = false,
}: { compact?: boolean }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [partial, setPartial] = useState('');
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
    // if (!event.result) return;
    console.log("Tool call event", event);
    if (compact) {
      // if (!event.userInfo) return;
      setTimeout(() => setCalls(
        previous => previous.filter(c => c.id !== event.id)
      ), 3500);
    }
    setCalls((previous) => [
      ...previous.filter(c => c.id !== event.id),
      event
    ]);
  }, [compact]);

  const handleAskAdditionalInfo = useCallback(async (message: string) => {
    setAskUserPrompt(message);
    await speak(message);
    startListening();
    setLoading(false);

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
        handleAskAdditionalInfo,
        handleToolCall,
        (route: string, queryParams?: Record<string, string>) => {
          const url = new URL("u:" + route);
          Object.entries(queryParams || {}).forEach(([key, value]) => {
            url.searchParams.set(key, value);
          });

          navigate({
            pathname: url.pathname, search: url.search
          });
        }
      ),
    [handleAskAdditionalInfo, handleToolCall]
  );

  const processText = useCallback(
    async (text: string, userLanguage: string) => {
      stopListening();
      setLoading(true);
      if (pendingAskResolver.current) {
        pendingAskResolver.current(text);
        return;
      }

      controller.run(text, userLanguage).then((result) => {
        if (result.warnings.length) {
          setWarnings((previous) => [...previous, ...result.warnings]);
        }
        if (result.limitResult && result.limitResult.success === false) {
          setWarnings((previous) => [...previous, result.limitResult.result]);
        }
        setLoading(false);
      }).catch((error) => {
        console.log("Erro ao processar comando do assistente", error);
        setWarnings((previous) => [...previous, "Erro ao processar comando do assistente"]);
        setLoading(false);
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

  if (compact) {
    return <div className="assistant-icon">
      <AIMicrophone parser={microphoneParser} compact withLoading={loading} onPartialResult={setPartial} />
      <div className="assistant-toasts">
        {askUserPrompt && (
          <GlassContainer className="assistant-toast">
            <strong>Pergunta do assistente:</strong>
            <pre>{askUserPrompt}</pre>
            <p className="assistant-ask-user__hint">
              Responda pelo microfone para continuar.
            </p>
          </GlassContainer>
        )}
        {calls.length > 0 && calls.filter(call => Boolean(call.userInfo)).map((call) => (
          <GlassContainer key={call.id} className="assistant-toast assistant-toast--call">
            <pre>{call.userInfo}</pre>
            <button onClick={() => setCalls(previous => previous.filter(c => c.id !== call.id))}>
              <Icon icon={Icons.faTrash} />
            </button>
          </GlassContainer>
        ))}
        {partial && (
          <GlassContainer className="assistant-toast assistant-toast--partial">
            <pre>{partial}</pre>
          </GlassContainer>
        )}
        {warnings.map((warning, index) => (
          <GlassContainer key={`${warning}-${index}`}>
            <strong>Aviso:</strong> {warning}
          </GlassContainer>
        ))}
      </div>
    </div>;
  }

  const formattedCalls = useMemo(() => [...calls].reverse(), [calls]);

  const modelUsage = normalizeUsage(resourcesUse.sessionUse.ai?.[ASSISTANT_MODEL]);
  const totalTokens = modelUsage.input + modelUsage.output;
  const assistantCosts = useMemo(
    () =>
      AiCallContext.getCurrentCosts({
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
              <Icon aria-label="Clique aqui para ouvir a mensagem" icon={Icons.faVolumeUp} />
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
