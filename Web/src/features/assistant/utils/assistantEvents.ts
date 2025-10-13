const assistantEventTarget = new EventTarget();

export type AssistantEventMap = {
  'assistant:start-onboarding': void;
  'assistant:onboarding-reset': void;
  'assistant:micro-onboarding-completed': void;
};

type EventKey = keyof AssistantEventMap;

type EventHandler<K extends EventKey> = (detail: AssistantEventMap[K]) => void;

export function dispatchAssistantEvent<K extends EventKey>(type: K, detail?: AssistantEventMap[K]): void {
  const event = new CustomEvent(type, { detail });
  assistantEventTarget.dispatchEvent(event);
}

export function subscribeAssistantEvent<K extends EventKey>(type: K, handler: EventHandler<K>): () => void {
  const listener = ((event: Event) => {
    handler((event as CustomEvent<AssistantEventMap[K]>).detail);
  }) as EventListener;

  assistantEventTarget.addEventListener(type, listener);
  return () => assistantEventTarget.removeEventListener(type, listener);
}
