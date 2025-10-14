import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import AIMicrophone, { type AIMicrophoneHandle, type AIMicrophoneProps } from "@components/voice/AIMicrophone";
import type { AIItemData } from "@features/speech/AIParserManager";
import Metric from "@features/tabs/resourceUsage/Metric";
import getRepositories from "@repositories";

import AssistantController, { getAssistantModel } from "../AssistantController";
import { AssistantMicrophoneAdapter } from "../microphoneAdapter";
import type { AssistantToolCallLog } from "../tools/types";
import ToolCallLogList from "./ToolCallLogList";

import "./AssistantPage.css";
import Icon, { Icons } from "@components/Icons";
import GlassContainer from "@components/GlassContainer";
import { startListening, stopListening } from "@components/voice/microfone";
import { AiCallContext, AIUse } from "@models";
import { speak } from "@features/tabs/settings/sections/VoicePreferencesSection";
import { subscribeAssistantEvent } from "../utils/assistantEvents";

export default function AssistantPage({
  compact = false,
}: { compact?: boolean }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [partial, setPartial] = useState('');
  const [calls, setCalls] = useState<AssistantToolCallLog[]>([]);
  const [askUserPrompt, setAskUserPrompt] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const pendingAskResolver = useRef<((answer: string) => void) | null>(null);
  const resourcesUse = useMemo(() => getRepositories().resourcesUse, []);
  const microphoneRef = useRef<AIMicrophoneHandle | null>(null);
  const onboardingFlowRef = useRef(false);

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
    setLoading(false);
    setIsFirst(false);
    setAskUserPrompt(message);
    stopListening();
    try {
      setSpeaking(true);
      await speak(message, { important: true });
    } catch (error) {
      setWarnings((previous) => [...previous, "Erro ao falar a mensagem"]);
    } finally {
      setSpeaking(false);
    }
    startListening();

    return new Promise<string>((resolve) => {
      pendingAskResolver.current = (answer: string) => {
        pendingAskResolver.current = null;
        setAskUserPrompt(null);
        resolve(answer);
      };
    });
  }, []);

  useEffect(() => {
    if (loading && !askUserPrompt) {
      const init = isFirst
        ? Promise.resolve() 
        : speak("OK", { rate: 1.4 })
          ?.then(() => speak("ta", { rate: 1.2 }))
      init
        ?.then(() => speak("humm, hum hum, hum hum", { rate: 0.01, volume: 0.03 }))
        ?.then(() =>
          isFirst ? Promise.resolve() : speak("ah", { rate: 0.8, volume: 0.25 })
        )
    };
  }, [loading, isFirst, askUserPrompt]);

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

  useEffect(() => {
    return subscribeAssistantEvent('assistant:start-onboarding', async () => {
      if (onboardingFlowRef.current) return;
      onboardingFlowRef.current = true;
      try {
        const microphone = microphoneRef.current;
        const micReady = microphone
          ? await microphone.ensureOnboardingCompleted()
          : true;

        if (micReady) {
          await processText('init', CurrentLangInfo.short);
        }
      } catch (error) {
        console.error('Failed to start assistant onboarding flow', error);
      } finally {
        onboardingFlowRef.current = false;
      }
    });
  }, [processText]);

  if (compact) {
    return <div className="assistant-icon">
      <AIMicrophone
        ref={microphoneRef}
        parser={microphoneParser}
        compact
        withLoading={loading}
        onPartialResult={setPartial}
      />
      <div className="assistant-toasts">
        {speaking && <>
          <GlassContainer>
            <strong>Aviso:</strong> estou falando, aumente o volume do seu dispositivo.
          </GlassContainer>
        </>}
        {warnings.map((warning, index) => (
          <GlassContainer key={`${warning}-${index}`}>
            <strong>Aviso:</strong> {warning}
          </GlassContainer>
        ))}
        {calls.length > 0 && calls.filter(call => Boolean(call.userInfo)).map((call) => (
          <GlassContainer key={call.id} className="assistant-toast assistant-toast--call">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>Info:</strong>
              <button onClick={() => setCalls(previous => previous.filter(c => c.id !== call.id))}>
                <Icon icon={Icons.faTrash} size="xs" />
              </button>
            </div>
            <pre>{call.userInfo}</pre>
          </GlassContainer>
        ))}
        {askUserPrompt && (
          <GlassContainer className="assistant-toast">
            <strong>Assistente:</strong>
            <pre>{askUserPrompt}</pre>
            <p className="assistant-ask-user__hint">
              Responda pelo microfone para continuar.
            </p>
          </GlassContainer>
        )}
        {loading && !askUserPrompt && (
          <GlassContainer className="assistant-toast">
            <strong>Assistente pensando, aguarde:</strong>
            <pre>Hummm.....</pre>
          </GlassContainer>
        )}
        {partial && (
          <GlassContainer className="assistant-toast assistant-toast--partial">
            <strong>Você:</strong> <pre>{partial}</pre>
          </GlassContainer>
        )}
      </div>
    </div>;
  }

  const formattedCalls = useMemo(() => [...calls].reverse(), [calls]);

  const modelUsage = normalizeUsage(resourcesUse.sessionUse.ai?.[getAssistantModel()]);
  const totalTokens = modelUsage.input + modelUsage.output;
  const assistantCosts = useMemo(
    () =>
      AiCallContext.getCurrentCosts({
        [getAssistantModel()]: modelUsage as AIUse<number>,
      }),
    [modelUsage]
  );

  return (
    <div className="assistant-page">
      <div className="assistant-page__microphone">
        <AIMicrophone ref={microphoneRef} parser={microphoneParser} disableClick={loading} />
      </div>
      <div className="assistant-page__content">
        <section className="assistant-section assistant-section--usage">
          <div className="assistant-usage__header">
            <h2>Uso de Tokens</h2>
            <span className="assistant-usage__model">Modelo {getAssistantModel()}</span>
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
