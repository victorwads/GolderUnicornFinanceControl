import {
  forwardRef,
  useCallback,
  useEffectEvent,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AIMicrophone, { type AIMicrophoneHandle, type AIMicrophoneProps } from "@componentsDeprecated/voice/AIMicrophone";
import AssistantVoiceOverlay, { type AssistantVoiceOverlayState, type InfoBalloon } from "@components/AssistantVoiceOverlay";
import type { AIItemData } from "@features/speech/AIParserManager";
import Metric from "@features/tabs/resourceUsage/Metric";
import getRepositories from "@repositories";

import AssistantController, { getAssistantModel } from "../AssistantController";
import { AssistantMicrophoneAdapter } from "../microphoneAdapter";
import type { AssistantToolCallLog } from "../tools/types";
import ToolCallLogList from "./ToolCallLogList";

import "./AssistantPage.css";
import Icon, { Icons } from "@componentsDeprecated/Icons";
import { startListening, stopListening } from "@componentsDeprecated/voice/microfone";
import { AiCallContext, AIUse } from "@models";
import { speak } from "@features/tabs/settings/sections/VoicePreferencesSection";
import { subscribeAssistantEvent } from "../utils/assistantEvents";
import { getAssistantMode } from "../preferences";

export interface AssistantPageHandle {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
}

interface AssistantPageProps {
  compact?: boolean;
  showTrigger?: boolean;
  onListeningChange?: (listening: boolean) => void;
}

const AssistantPage = forwardRef<AssistantPageHandle, AssistantPageProps>(function AssistantPage({
  compact = false,
  showTrigger = true,
  onListeningChange,
}, ref) {
  const AUTO_SEND_DELAY_MS = 2400;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [partial, setPartial] = useState('');
  const [draftText, setDraftText] = useState('');
  const [voiceState, setVoiceState] = useState<AssistantVoiceOverlayState>('idle');
  const [assistantMessage, setAssistantMessage] = useState<string | null>(null);
  const [autoSendProgress, setAutoSendProgress] = useState(0);
  const [isLiveMode, setIsLiveMode] = useState(() => getAssistantMode() === "live");
  const [calls, setCalls] = useState<AssistantToolCallLog[]>([]);
  const [askUserPrompt, setAskUserPrompt] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const pendingAskResolver = useRef<((answer: string) => void) | null>(null);
  const resourcesUse = useMemo(() => getRepositories().resourcesUse, []);
  const microphoneRef = useRef<AIMicrophoneHandle | null>(null);
  const onboardingFlowRef = useRef(false);
  const isListeningRef = useRef(false);
  const partialRef = useRef("");
  const draftTextRef = useRef("");
  const manualEditRef = useRef(false);
  const autoSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSendIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const loadingRef = useRef(false);

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

  const cancelAutoSend = useCallback(() => {
    if (autoSendTimeoutRef.current) {
      clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    if (autoSendIntervalRef.current) {
      clearInterval(autoSendIntervalRef.current);
      autoSendIntervalRef.current = null;
    }
    setAutoSendProgress(0);
  }, []);

  const processVoiceTurn = useEffectEvent(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    cancelAutoSend();
    manualEditRef.current = false;
    setVoiceState("sending");
    setAssistantMessage("Hmm...");
    setDraftText("");
    draftTextRef.current = "";
    setPartial("");
    partialRef.current = "";
    microphoneRef.current?.stopListening();
    microphoneRef.current?.clearTranscript();
    await processText(trimmed, CurrentLangInfo.short);
  });

  const scheduleAutoSend = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || !isLiveMode || manualEditRef.current) {
      setVoiceState(trimmed ? "paused" : "idle");
      return;
    }

    cancelAutoSend();
    setVoiceState("paused");
    setAutoSendProgress(0);

    const startedAt = Date.now();
    autoSendIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setAutoSendProgress(Math.min(100, (elapsed / AUTO_SEND_DELAY_MS) * 100));
    }, 80);

    autoSendTimeoutRef.current = setTimeout(() => {
      cancelAutoSend();
      void processVoiceTurn(trimmed);
    }, AUTO_SEND_DELAY_MS);
  }, [cancelAutoSend, isLiveMode, processVoiceTurn]);

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

  useImperativeHandle(ref, () => ({
    startListening: () => {
      microphoneRef.current?.startListening();
    },
    stopListening: () => {
      microphoneRef.current?.stopListening();
    },
    toggleListening: () => {
      microphoneRef.current?.toggleListening();
    },
  }), []);

  useEffect(() => {
    if (!compact) {
      return;
    }

    if (partial && isListeningRef.current && !manualEditRef.current) {
      draftTextRef.current = partial;
      setDraftText(partial);
      setVoiceState("listening");
    }

    if (!partial && !isListeningRef.current && !loadingRef.current && !askUserPrompt && !draftText.trim()) {
      setVoiceState(assistantMessage ? "responded" : "idle");
    }
  }, [askUserPrompt, assistantMessage, compact, draftText, partial]);

  useEffect(() => {
    const wasLoading = loadingRef.current;
    loadingRef.current = loading;

    if (!compact) {
      return;
    }

    if (loading) {
      cancelAutoSend();
      setVoiceState("thinking");
      setAssistantMessage("Hmm...");
      return;
    }

    if (wasLoading && !loading) {
      setVoiceState("responded");
      if (askUserPrompt) {
        setAssistantMessage(askUserPrompt);
      } else {
        setAssistantMessage("Pronto. Continue por voz ou escreva para seguir.");
      }
      setIsLiveMode(getAssistantMode() === "live");
    }
  }, [askUserPrompt, cancelAutoSend, compact, loading]);

  useEffect(() => {
    if (!compact || !askUserPrompt) {
      return;
    }

    setAssistantMessage(askUserPrompt);
  }, [askUserPrompt, compact]);

  useEffect(() => () => cancelAutoSend(), [cancelAutoSend]);

  if (compact) {
    const infoBalloons: InfoBalloon[] = calls
      .filter((call) => Boolean(call.userInfo))
      .slice(-4)
      .map((call, index) => ({
        id: `${call.id}-${index}`,
        text: call.userInfo as string,
      }));

    return <div className="assistant-icon">
      <AIMicrophone
        ref={microphoneRef}
        parser={microphoneParser}
        compact
        hideChrome={!showTrigger}
        withLoading={loading}
        autoProcessDelayMs={null}
        onPartialResult={(text) => {
          partialRef.current = text;
          setPartial(text);
        }}
        onListeningChange={(listening) => {
          isListeningRef.current = listening;
          onListeningChange?.(listening);

          if (listening) {
            manualEditRef.current = false;
            setIsLiveMode(getAssistantMode() === "live");
            cancelAutoSend();
            setVoiceState("listening");
            return;
          }

          const nextDraft = (manualEditRef.current ? draftTextRef.current : partialRef.current).trim();
          if (!nextDraft) {
            setVoiceState(assistantMessage ? "responded" : "idle");
            return;
          }

          scheduleAutoSend(nextDraft);
        }}
      />
      <AssistantVoiceOverlay
        state={voiceState}
        userText={draftText}
        assistantText={speaking ? "Estou falando. Aumente o volume do dispositivo se necessario." : (assistantMessage || "")}
        infoBalloons={infoBalloons}
        autoSendProgress={autoSendProgress}
        isAssistantThinking={voiceState === "thinking"}
        hasStarted={voiceState !== "idle"}
        assistantHasAppeared={Boolean(assistantMessage) || voiceState === "thinking" || Boolean(askUserPrompt)}
        isLiveMode={isLiveMode}
        onUserTextChange={(value) => {
          manualEditRef.current = true;
          cancelAutoSend();
          setIsLiveMode(false);
          draftTextRef.current = value;
          setDraftText(value);
          setVoiceState(value.trim() ? "paused" : "idle");
        }}
        onUserTextClick={() => {
          if (!isLiveMode) return;
          cancelAutoSend();
          setIsLiveMode(false);
        }}
        onStopOrClear={() => {
          if (voiceState === "listening") {
            microphoneRef.current?.stopListening();
            return;
          }

          cancelAutoSend();
          draftTextRef.current = "";
          partialRef.current = "";
          setDraftText("");
          setPartial("");
          setVoiceState(assistantMessage ? "responded" : "idle");
        }}
        onSend={() => {
          void processVoiceTurn(draftText);
        }}
      />
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
});

export default AssistantPage;
