import { Mic, MicOff, StopCircle, Send, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@lib/utils";
import { Textarea } from "@components/ui/textarea";
import { Button } from "@components/ui/button";

type AssistantState = "idle" | "listening" | "paused" | "sending" | "thinking" | "responded";

interface InfoBalloon {
  id: string;
  text: string;
}

export const VoiceAssistant = () => {
  const [state, setState] = useState<AssistantState>("idle");
  const [userText, setUserText] = useState("");
  const [assistantText, setAssistantText] = useState("");
  const [infoBalloons, setInfoBalloons] = useState<InfoBalloon[]>([]);
  const [autoSendProgress, setAutoSendProgress] = useState(0);
  const [isAssistantThinking, setIsAssistantThinking] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [assistantHasAppeared, setAssistantHasAppeared] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(true); // Controla se está em modo live ou manual
  
  const autoSendTimer = useRef<NodeJS.Timeout | null>(null);
  const textChangeTimer = useRef<NodeJS.Timeout | null>(null);

  // Simula o texto sendo capturado
  const simulateListening = () => {
    const texts = [
      "Olá",
      "Olá assistente",
      "Olá assistente, como",
      "Olá assistente, como estão",
      "Olá assistente, como estão minhas",
      "Olá assistente, como estão minhas finanças?",
    ];
    
    let index = 0;
    const interval = setInterval(() => {
      if (index < texts.length && state === "listening") {
        setUserText(texts[index]);
        index++;
      } else {
        clearInterval(interval);
        if (state === "listening") {
          // Inicia auto-send após parar de falar
          startAutoSend();
        }
      }
    }, 500);
  };

  // Inicia o timer de auto-envio
  const startAutoSend = () => {
    if (autoSendTimer.current) clearInterval(autoSendTimer.current);
    setAutoSendProgress(0);
    
    const duration = 3000; // 3 segundos - pode ser configurável
    const steps = 60;
    const increment = 100 / steps;
    const stepTime = duration / steps;
    
    let progress = 0;
    autoSendTimer.current = setInterval(() => {
      progress += increment;
      setAutoSendProgress(progress);
      
      if (progress >= 100) {
        handleSend();
      }
    }, stepTime);
  };

  // Reseta o timer de auto-envio quando o texto muda (apenas em modo live)
  useEffect(() => {
    if (state === "listening" && userText && isLiveMode) {
      if (textChangeTimer.current) clearTimeout(textChangeTimer.current);
      if (autoSendTimer.current) clearInterval(autoSendTimer.current);
      setAutoSendProgress(0);
      
      // Aguarda 500ms sem mudança no texto para iniciar auto-send
      textChangeTimer.current = setTimeout(() => {
        startAutoSend();
      }, 500);
    }
  }, [userText, state, isLiveMode]);

  // Limpa timers ao desmontar
  useEffect(() => {
    return () => {
      if (autoSendTimer.current) clearInterval(autoSendTimer.current);
      if (textChangeTimer.current) clearTimeout(textChangeTimer.current);
    };
  }, []);

  const handleMicClick = () => {
    if (state === "idle" || state === "responded") {
      setState("listening");
      setUserText("");
      setHasStarted(true);
      setIsLiveMode(true); // Ativa modo live ao iniciar por voz
      simulateListening();
    } else if (state === "listening") {
      setState("paused");
      if (autoSendTimer.current) clearInterval(autoSendTimer.current);
      setAutoSendProgress(0);
    }
  };

  const handleStopOrClear = () => {
    if (state === "listening") {
      // Para a escuta e inicia auto-send no modo live
      setState("paused");
      if (isLiveMode) {
        startAutoSend();
      }
    } else {
      // Limpa o texto
      setUserText("");
      if (autoSendTimer.current) clearInterval(autoSendTimer.current);
      setAutoSendProgress(0);
    }
  };

  const handleClose = () => {
    // Reseta completamente o assistente
    setState("idle");
    setUserText("");
    setAssistantText("");
    setInfoBalloons([]);
    setAutoSendProgress(0);
    setIsAssistantThinking(false);
    setHasStarted(false);
    setAssistantHasAppeared(false);
    setIsLiveMode(true);
    if (autoSendTimer.current) clearInterval(autoSendTimer.current);
    if (textChangeTimer.current) clearTimeout(textChangeTimer.current);
  };

  const handleTextareaClick = () => {
    // Ao clicar na textarea, desativa o modo live
    if (isLiveMode) {
      setIsLiveMode(false);
      if (autoSendTimer.current) clearInterval(autoSendTimer.current);
      setAutoSendProgress(0);
    }
  };

  const handleSend = () => {
    if (autoSendTimer.current) clearInterval(autoSendTimer.current);
    setState("sending");
    setAutoSendProgress(100);
    
    // Simula envio
    setTimeout(() => {
      setState("thinking");
      setIsAssistantThinking(true);
      setAssistantHasAppeared(true);
      
      // Adiciona balões de info
      addInfoBalloon("Pesquisando suas transações recentes...");
      
      setTimeout(() => {
        addInfoBalloon("Analisando padrões de gastos...");
        
        setTimeout(() => {
          setIsAssistantThinking(false);
          setAssistantText("Suas finanças estão equilibradas! Você gastou R$ 2.340,00 este mês e tem um saldo positivo de R$ 2.140,00. Seus principais gastos foram com alimentação e transporte.");
          setState("responded");
          setUserText("");
          setAutoSendProgress(0);
        }, 2000);
      }, 1500);
    }, 500);
  };

  const addInfoBalloon = (text: string) => {
    const id = Math.random().toString(36);
    setInfoBalloons(prev => [...prev, { id, text }]);
    
    // Remove após 7 segundos
    setTimeout(() => {
      setInfoBalloons(prev => prev.filter(b => b.id !== id));
    }, 7000);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex flex-col items-center justify-end pb-20">
      {/* Info Balloons */}
      <div className="flex flex-col items-center gap-2 mb-4 max-h-[40vh] overflow-hidden pointer-events-none">
        {infoBalloons.map((balloon) => (
          <div
            key={balloon.id}
            className="animate-fade-in bg-muted/90 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-2 shadow-lg"
          >
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">info:</span> {balloon.text}
            </p>
          </div>
        ))}
      </div>

      {/* Assistant Balloon - Sempre visível após aparecer */}
      {assistantHasAppeared && (
        <div className="animate-fade-in bg-primary/10 backdrop-blur-md border border-primary/30 rounded-2xl px-4 py-3 mb-3 max-w-[85vw] shadow-lg pointer-events-none">
          <p className="text-sm text-foreground mb-2">
            <span className="font-semibold text-primary">assistente:</span>{" "}
            {isAssistantThinking ? (
              <pre className="inline font-mono text-muted-foreground">hmm…</pre>
            ) : (
              assistantText
            )}
          </p>
          {!isAssistantThinking && assistantText && (
            <p className="text-xs text-muted-foreground italic mt-2 border-t border-primary/20 pt-2">
              Responda pelo microfone ou escreva para continuar.
            </p>
          )}
        </div>
      )}

      {/* User Balloon - Sempre visível após iniciar */}
      {hasStarted && (
        <div className="animate-fade-in bg-background/90 backdrop-blur-md border border-border/50 rounded-2xl px-4 py-3 mb-4 max-w-[85vw] shadow-lg flex items-start gap-3 pointer-events-auto">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">você:</p>
            <Textarea
              value={userText}
              onChange={(e) => setUserText(e.target.value)}
              onClick={handleTextareaClick}
              disabled={state !== "listening" && state !== "paused"}
              className="min-h-[60px] max-h-[120px] bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm resize-none disabled:opacity-50"
              placeholder={state === "listening" ? "Falando..." : ""}
            />
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botão Stop/Clear - muda com base no estado */}
            {(state === "listening" || state === "paused") && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full bg-destructive/20 hover:bg-destructive/30 text-destructive"
                onClick={handleStopOrClear}
              >
                {state === "listening" ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </Button>
            )}
            
            {/* Botão Enviar - sempre visível quando há texto */}
            {(state === "listening" || state === "paused" || state === "sending") && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 rounded-full hover:bg-primary/20 text-primary relative overflow-hidden"
                onClick={handleSend}
                disabled={state === "sending" || !userText}
              >
                <Send className="h-4 w-4 relative z-10" />
                {isLiveMode && state === "paused" && (
                  <div
                    className="absolute inset-0 bg-primary/20 transition-all duration-100"
                    style={{
                      width: `${autoSendProgress}%`,
                    }}
                  />
                )}
                {state === "sending" && (
                  <div
                    className="absolute inset-0 bg-primary/30 transition-all duration-300"
                    style={{
                      width: `${autoSendProgress}%`,
                    }}
                  />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Microphone Button */}
      <button
        onClick={handleMicClick}
        className={cn(
          "fixed bottom-20 left-1/2 -translate-x-1/2 z-40 pointer-events-auto",
          "w-16 h-16 rounded-full",
          "flex items-center justify-center",
          "transition-all duration-300 active:scale-95",
          "backdrop-blur-md border",
          state === "listening"
            ? "bg-primary/20 border-primary/30 text-primary shadow-[0_8px_32px_hsl(262_83%_58%/0.3)] animate-pulse-slow"
            : "bg-background/20 border-border/30 text-foreground shadow-lg hover:bg-background/30 hover:shadow-xl"
        )}
      >
        <div className="relative">
          {state === "idle" ? (
            <Mic className="w-6 h-6" />
          ) : (
            <MicOff className="w-6 h-6" />
          )}
          
          {state === "listening" && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="absolute w-8 h-8 rounded-full bg-primary/20 animate-ping" />
              <div className="absolute w-10 h-10 rounded-full bg-primary/10 animate-ping" style={{ animationDelay: "150ms" }} />
            </div>
          )}
        </div>
      </button>

      {/* Close Assistant Button */}
      {hasStarted && (
        <button
          onClick={handleClose}
          className="fixed bottom-20 left-1/2 translate-x-12 z-40 pointer-events-auto animate-fade-in px-3 py-2 rounded-full bg-destructive/20 hover:bg-destructive/30 backdrop-blur-md border border-destructive/30 text-destructive shadow-lg transition-all duration-300 active:scale-95 flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          <span className="text-xs font-medium whitespace-nowrap">encerrar assistente</span>
        </button>
      )}
    </div>
  );
};
