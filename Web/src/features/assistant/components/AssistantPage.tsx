import { useCallback, useMemo, useState } from 'react';

import AIMicrophone, { type AIMicrophoneProps } from '@components/voice/AIMicrophone';
import type { AIItemData } from '@features/speech/AIParserManager';

import AssistantController from '../AssistantController';
import { AssistantMicrophoneAdapter } from '../microphoneAdapter';
import type { AskUserPayload, AssistantToolCallLog } from '../types';
import ToolCallLogList from './ToolCallLogList';

import './AssistantPage.css';

export default function AssistantPage() {
  const controller = useMemo(() => new AssistantController(), []);

  const [calls, setCalls] = useState<AssistantToolCallLog[]>([]);
  const [askUserPrompt, setAskUserPrompt] = useState<AskUserPayload | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const processText = useCallback(async (text: string, userLanguage: string) => {
    const result = await controller.run(text, userLanguage);
    if (result.toolCalls.length) {
      setCalls((previous) => [...previous, ...result.toolCalls]);
    }
    setAskUserPrompt(result.askUserPrompt);
    if (result.warnings.length) {
      setWarnings((previous) => [...previous, ...result.warnings]);
    }
  }, [controller]);

  const parser = useMemo(() => new AssistantMicrophoneAdapter(processText), [processText]);
  const microphoneParser = parser as unknown as AIMicrophoneProps<AIItemData, string>['parser'];

  return (
    <div className="assistant-page">
      <div className="assistant-page__microphone">
        <AIMicrophone parser={microphoneParser} />
      </div>
      <div className="assistant-page__content">
        <section className="assistant-section">
          <h2>Tool calls</h2>
          <ToolCallLogList calls={calls} />
        </section>
        {askUserPrompt && (
          <section className="assistant-section assistant-section--highlight">
            <h2>Pergunta para o usuário</h2>
            <p className="assistant-ask-user__message">{askUserPrompt.message}</p>
            {askUserPrompt.options?.length ? (
              <ul className="assistant-ask-user__options">
                {askUserPrompt.options.map((option) => (
                  <li key={option.id}>{option.label}</li>
                ))}
              </ul>
            ) : null}
            <p className="assistant-ask-user__hint">Responda pelo microfone para continuar.</p>
          </section>
        )}
        {warnings.length > 0 && (
          <section className="assistant-section assistant-section--warnings">
            <h2>Avisos</h2>
            <ul>
              {warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
