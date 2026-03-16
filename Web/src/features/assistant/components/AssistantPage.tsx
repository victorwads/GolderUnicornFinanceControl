import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import AIMicrophone, { type AIMicrophoneHandle, type AIMicrophoneProps } from "@componentsDeprecated/voice/AIMicrophone";
import AssistantVoiceOverlay, { type AssistantVoiceOverlayState } from "@components/AssistantVoiceOverlay";
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
import { getAssistantMicrophoneMode, getAssistantMode } from "../preferences";
import type { AssistantTimelineEntry } from "@pages/assistant/assistantHistoryAdapter";
import { buildAssistantHistoryConversation } from "@pages/assistant/assistantHistoryAdapter";

export interface AssistantPageHandle {
  startListening: () => void;
  stopListening: () => void;
  toggleListening: () => void;
  startPressListening?: () => void;
  endPressListening?: () => void;
}

interface AssistantPageProps {
  compact?: boolean;
  showTrigger?: boolean;
  onListeningChange?: (listening: boolean) => void;
}

const LIVE_MODE_SILENCE_DELAY_MS = 1400;
const AUTO_SEND_DURATION_MS = 1300;

const AssistantPage = forwardRef<AssistantPageHandle, AssistantPageProps>(function AssistantPage({
  compact = false,
  showTrigger = true,
  onListeningChange,
}, ref) {
  const runtimeTexts = Lang.assistant.voiceRuntime;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const [partial, setPartial] = useState('');
  const [draftText, setDraftText] = useState('');
  const [voiceState, setVoiceState] = useState<AssistantVoiceOverlayState>('idle');
  const [calls, setCalls] = useState<AssistantToolCallLog[]>([]);
  const [askUserPrompt, setAskUserPrompt] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const pendingAskResolver = useRef<((answer: string) => void) | null>(null);
  const repositories = useMemo(() => getRepositories(), []);
  const resourcesUse = useMemo(() => repositories.resourcesUse, [repositories]);
  const aiCalls = useMemo(() => repositories.aiCalls, [repositories]);
  const microphoneRef = useRef<AIMicrophoneHandle | null>(null);
  const onboardingFlowRef = useRef(false);
  const isListeningRef = useRef(false);
  const partialRef = useRef("");
  const draftTextRef = useRef("");
  const isEditingRef = useRef(false);
  const askUserPromptRef = useRef<string | null>(null);
  const holdActiveRef = useRef(false);
  const autoSendTimerRef = useRef<number | null>(null);
  const textChangeTimerRef = useRef<number | null>(null);
  const [autoSendProgress, setAutoSendProgress] = useState(0);
  const [assistantMode, setAssistantMode] = useState(getAssistantMode());
  const [microphoneMode, setMicrophoneMode] = useState(getAssistantMicrophoneMode());
  const [activeContextId, setActiveContextId] = useState<string | null>(null);
  const [timelineEntries, setTimelineEntries] = useState<AssistantTimelineEntry[]>([]);

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

  useEffect(() => {
    askUserPromptRef.current = askUserPrompt;
  }, [askUserPrompt]);

  const cancelAutoSend = useCallback(() => {
    if (autoSendTimerRef.current !== null) {
      window.clearInterval(autoSendTimerRef.current);
      autoSendTimerRef.current = null;
    }
    if (textChangeTimerRef.current !== null) {
      window.clearTimeout(textChangeTimerRef.current);
      textChangeTimerRef.current = null;
    }
    setAutoSendProgress(0);
  }, []);

  const syncPreferences = useCallback(() => {
    setAssistantMode(getAssistantMode());
    setMicrophoneMode(getAssistantMicrophoneMode());
  }, []);

  useEffect(() => {
    window.addEventListener("storage", syncPreferences);
    window.addEventListener("focus", syncPreferences);
    return () => {
      window.removeEventListener("storage", syncPreferences);
      window.removeEventListener("focus", syncPreferences);
    };
  }, [syncPreferences]);

  const syncTimelineEntries = useCallback((contextId?: string | null) => {
    const targetId = contextId ?? activeContextId;
    if (!targetId) {
      setTimelineEntries([]);
      return;
    }

    const context = aiCalls.getCache(true).find((item) => item.id === targetId);
    if (!context) {
      setTimelineEntries([]);
      return;
    }

    setTimelineEntries(buildAssistantHistoryConversation(context).entries);
  }, [activeContextId, aiCalls]);

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
      await speak(message, { important: true });
    } catch (error) {
      setWarnings((previous) => [...previous, runtimeTexts.speakError]);
    }
    if (getAssistantMode() === "live") {
      startListening();
    }

    return new Promise<string>((resolve) => {
      pendingAskResolver.current = (answer: string) => {
        pendingAskResolver.current = null;
        setAskUserPrompt(null);
        resolve(answer);
      };
    });
  }, [runtimeTexts.speakError]);

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
        },
        (context) => {
          setActiveContextId(context.id);
          setTimelineEntries(buildAssistantHistoryConversation(context).entries);
        }
      ),
    [handleAskAdditionalInfo, handleToolCall, navigate]
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
        setWarnings((previous) => [...previous, runtimeTexts.processError]);
        setLoading(false);
      });
    },
    [controller, runtimeTexts.processError]
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
    if (!compact) {
      return;
    }

    const sync = () => syncTimelineEntries();
    sync();
    return aiCalls.addUpdatedEventListenner(sync);
  }, [aiCalls, compact, syncTimelineEntries]);

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

  useEffect(() => {
    if (!compact) {
      return;
    }

    if (isListeningRef.current) {
      setVoiceState("listening");
      return;
    }

    setVoiceState(draftText.trim() ? "paused" : "idle");
  }, [compact, draftText]);

  const sendDraft = useCallback(async () => {
    const nextText = draftTextRef.current.trim();
    if (!nextText || loading) {
      return;
    }

    cancelAutoSend();
    microphoneRef.current?.stopListening();
    setVoiceState("sending");
    draftTextRef.current = "";
    setDraftText("");
    partialRef.current = "";
    setPartial("");
    await processText(nextText, CurrentLangInfo.short);
    microphoneRef.current?.clearTranscript();
    isEditingRef.current = false;
    holdActiveRef.current = false;

    const currentAssistantMode = getAssistantMode();
    if (currentAssistantMode === "live" && !askUserPromptRef.current && !pendingAskResolver.current) {
      setVoiceState("idle");
      microphoneRef.current?.startListening();
      return;
    }

    setVoiceState("idle");
  }, [cancelAutoSend, loading, processText]);

  const startAutoSend = useCallback(() => {
    cancelAutoSend();
    setAutoSendProgress(0);

    const durationMs = AUTO_SEND_DURATION_MS;
    const steps = 60;
    const increment = 100 / steps;
    const stepTime = durationMs / steps;
    let progress = 0;

    autoSendTimerRef.current = window.setInterval(() => {
      progress += increment;
      setAutoSendProgress(Math.min(progress, 100));

      if (progress >= 100) {
        cancelAutoSend();
        void sendDraft();
      }
    }, stepTime);
  }, [cancelAutoSend, sendDraft]);

  useEffect(() => {
    if (!compact || assistantMode !== "live") {
      cancelAutoSend();
      return;
    }

    if (!isListeningRef.current || isEditingRef.current || loading) {
      return;
    }

    const nextText = partialRef.current.trim();
    if (!nextText) {
      cancelAutoSend();
      return;
    }

    cancelAutoSend();
    textChangeTimerRef.current = window.setTimeout(() => {
      if (!partialRef.current.trim() || !isListeningRef.current) {
        return;
      }

      setVoiceState("paused");
      startAutoSend();
    }, LIVE_MODE_SILENCE_DELAY_MS);

    return () => {
      if (textChangeTimerRef.current !== null) {
        window.clearTimeout(textChangeTimerRef.current);
        textChangeTimerRef.current = null;
      }
    };
  }, [assistantMode, cancelAutoSend, compact, loading, partial, startAutoSend]);

  useEffect(() => {
    return () => {
      cancelAutoSend();
    };
  }, [cancelAutoSend]);

  useImperativeHandle(ref, () => ({
    startListening: () => {
      microphoneRef.current?.startListening();
    },
    stopListening: () => {
      microphoneRef.current?.stopListening();
      cancelAutoSend();
    },
    toggleListening: () => {
      const currentAssistantMode = getAssistantMode();
      const currentMicrophoneMode = getAssistantMicrophoneMode();

      if (currentAssistantMode === "manual" && currentMicrophoneMode === "click") {
        if (isListeningRef.current) {
          microphoneRef.current?.stopListening();
          void sendDraft();
          return;
        }

        draftTextRef.current = "";
        partialRef.current = "";
        setDraftText("");
        setPartial("");
        microphoneRef.current?.startListening();
        return;
      }

      microphoneRef.current?.toggleListening();
    },
    startPressListening: () => {
      if (assistantMode !== "manual" || microphoneMode !== "hold" || holdActiveRef.current) {
        return;
      }

      holdActiveRef.current = true;
      draftTextRef.current = "";
      partialRef.current = "";
      setDraftText("");
      setPartial("");
      microphoneRef.current?.startListening();
    },
    endPressListening: () => {
      if (assistantMode !== "manual" || microphoneMode !== "hold" || !holdActiveRef.current) {
        return;
      }

      holdActiveRef.current = false;
      microphoneRef.current?.stopListening();
      void sendDraft();
    },
  }), [assistantMode, cancelAutoSend, microphoneMode, sendDraft]);

  if (compact) {
    const isLiveMode = assistantMode === "live";

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
          if (!isEditingRef.current) {
            draftTextRef.current = text;
            setDraftText(text);
          }
        }}
        onListeningChange={(listening) => {
          isListeningRef.current = listening;
          onListeningChange?.(listening);
          if (listening) {
            isEditingRef.current = false;
          }
          if (!listening && assistantMode !== "live") {
            cancelAutoSend();
          }
          setVoiceState(listening ? "listening" : (draftTextRef.current.trim() ? "paused" : "idle"));
        }}
      />
      <AssistantVoiceOverlay
        state={voiceState}
        userText={draftText}
        assistantText=""
        infoBalloons={[]}
        entries={timelineEntries}
        entryLimit={8}
        autoSendProgress={autoSendProgress}
        isAssistantThinking={loading}
        isSendLocked={loading}
        hasStarted={voiceState !== "idle" || Boolean(draftText.trim()) || timelineEntries.length > 0}
        assistantHasAppeared={false}
        isLiveMode={isLiveMode}
        onUserTextChange={(value) => {
          cancelAutoSend();
          isEditingRef.current = true;
          draftTextRef.current = value;
          setDraftText(value);
          setVoiceState(value.trim() ? "paused" : "idle");
        }}
        onUserTextClick={() => {
          microphoneRef.current?.stopListening();
          cancelAutoSend();
          setVoiceState(draftTextRef.current.trim() ? "paused" : "idle");
        }}
        onUserTextKeyDown={(event) => {
          if (event.key === "Enter" && !event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            if (loading) {
              return;
            }
            void sendDraft();
          }
        }}
        onSend={() => {
          void sendDraft();
        }}
        showControls={true}
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
            <h2>{runtimeTexts.tokenUsageTitle}</h2>
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
            <h2>{runtimeTexts.askUserTitle}</h2>
            <pre className="assistant-ask-user__message">{askUserPrompt}</pre>
            <p className="assistant-ask-user__hint">
              {runtimeTexts.askUserHint}
              <Icon aria-label="Clique aqui para ouvir a mensagem" icon={Icons.faVolumeUp} />
            </p>
          </section>
        )}
        {warnings.length > 0 && (
          <section className="assistant-section assistant-section--warnings">
            <h2>
              {runtimeTexts.warningsTitle} <button onClick={() => setWarnings([])}>{Lang.commons.clear}</button>
            </h2>
            <ul>
              {warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </section>
        )}
        <section className="assistant-section">
          <h2>{runtimeTexts.callsHistoryTitle}</h2>
          <ToolCallLogList calls={formattedCalls} />
        </section>
      </div>
    </div>
  );
});

export default AssistantPage;
