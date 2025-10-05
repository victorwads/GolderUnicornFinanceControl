import './AiCallsScreen.css';
import { useEffect, useMemo, useState } from 'react';

import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import getRepositories from '@repositories';
import type { AiCall } from '@models';

type AiCallLogEntry = {
  role?: string;
  timestamp?: string;
  data?: unknown;
};

type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  entries: AiCallLogEntry[];
};

const UNTITLED = 'Conversa sem título';

const AiCallsScreen = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const repo = getRepositories().aiCalls;

    const sync = (items: AiCall[]) => {
      const normalized = normalizeConversations(items);
      setConversations(normalized);
      setSelectedId((previous) => {
        if (previous && normalized.some((item) => item.id === previous)) {
          return previous;
        }
        return normalized[0]?.id ?? null;
      });
    };

    repo.getAll().then(sync).catch(() => sync(repo.getCache()));

    return repo.addUpdatedEventListenner((items) => sync(items));
  }, []);

  const selectedConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === selectedId) ?? null,
    [conversations, selectedId]
  );

  return (
    <Container screen spaced full className="AiCallsScreen">
      <ContainerFixedContent>
        <header className="AiCallsScreen__header">
          <div>
            <h2>AI Calls</h2>
            <p className="AiCallsScreen__subtitle">
              Visualize as conversas salvas do assistente com o histórico completo em JSON.
            </p>
          </div>
        </header>
      </ContainerFixedContent>
      <ContainerScrollContent>
        <div className="AiCallsLayout">
          <aside className="AiCallsList">
            {conversations.length === 0 ? (
              <div className="AiCallsList__empty">Nenhuma conversa encontrada.</div>
            ) : (
              <ul>
                {conversations.map((conversation) => (
                  <li
                    key={conversation.id}
                    className={conversation.id === selectedId ? 'is-selected' : ''}
                    onClick={() => setSelectedId(conversation.id)}
                  >
                    <strong className="AiCallsList__title">{conversation.title}</strong>
                    <span className="AiCallsList__time">{formatRelativeTime(conversation.updatedAt)}</span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
          <section className="AiCallsThread">
            {selectedConversation ? (
              <ConversationMessages conversation={selectedConversation} />
            ) : (
              <div className="AiCallsThread__empty">
                Selecione uma conversa para visualizar os detalhes.
              </div>
            )}
          </section>
        </div>
      </ContainerScrollContent>
    </Container>
  );
};

export default AiCallsScreen;

function normalizeConversations(items: AiCall[]): Conversation[] {
  return items
    .map((item) => {
      const entries = extractEntries(item);
      const title = deriveTitle(entries) || UNTITLED;
      const updatedAt = getConversationTimestamp(item, entries);
      return {
        id: item.id,
        title,
        updatedAt,
        entries,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function extractEntries(call: AiCall): AiCallLogEntry[] {
  if (!Array.isArray(call.messages)) return [];
  return call.messages.map((entry) => (isLogEntry(entry) ? entry : { data: entry }));
}

function isLogEntry(entry: unknown): entry is AiCallLogEntry {
  if (!entry || typeof entry !== 'object') return false;
  return 'data' in (entry as Record<string, unknown>) || 'role' in (entry as Record<string, unknown>);
}

function deriveTitle(entries: AiCallLogEntry[]): string {
  const userEntry = entries[1] ?? entries.find((entry) => entry.role === 'user');
  if (!userEntry) return '';
  const data = userEntry.data;
  if (data && typeof data === 'object') {
    const message = (data as { message?: { text?: unknown } }).message;
    if (message && typeof message === 'object') {
      const text = (message as { text?: unknown }).text;
      if (typeof text === 'string' && text.trim()) return text.trim();
    }
    const directText = (data as { text?: unknown }).text;
    if (typeof directText === 'string' && directText.trim()) return directText.trim();
  }
  return '';
}

function getConversationTimestamp(call: AiCall, entries: AiCallLogEntry[]): number {
  const lastEntryWithTimestamp = [...entries]
    .reverse()
    .find((entry) => entry.timestamp && !Number.isNaN(Date.parse(entry.timestamp)));

  if (lastEntryWithTimestamp?.timestamp) {
    return Date.parse(lastEntryWithTimestamp.timestamp);
  }

  const updatedAt = (call as { _updatedAt?: Date })._updatedAt;
  if (updatedAt instanceof Date) return updatedAt.getTime();

  return Date.now();
}

function formatRelativeTime(timestamp: number): string {
  if (!Number.isFinite(timestamp)) return '';
  const delta = Date.now() - timestamp;
  const abs = Math.abs(delta);

  const minutes = Math.round(abs / (1000 * 60));
  if (minutes < 1) return 'Agora';
  if (minutes < 60) return `${minutes} minuto${minutes === 1 ? '' : 's'} atrás`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hora${hours === 1 ? '' : 's'} atrás`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days} dia${days === 1 ? '' : 's'} atrás`;

  return new Date(timestamp).toLocaleString();
}

type ConversationMessagesProps = {
  conversation: Conversation;
};

function ConversationMessages({ conversation }: ConversationMessagesProps) {
  return (
    <div className="AiCallsMessages">
      <header className="AiCallsMessages__header">
        <div>
          <h3>{conversation.title}</h3>
          <span>{new Date(conversation.updatedAt).toLocaleString()}</span>
        </div>
      </header>
      <div className="AiCallsMessages__list">
        {conversation.entries.map((entry, index) => (
          <article
            key={`${entry.timestamp ?? 'entry'}-${index}`}
            className={`AiCallsMessage AiCallsMessage--${entry.role ?? 'unknown'}`}
          >
            <div className="AiCallsMessage__meta">
              <span className="AiCallsMessage__role">{entry.role ?? 'unknown'}</span>
              {entry.timestamp && (
                <span className="AiCallsMessage__time">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              )}
            </div>
            <pre>{formatJson(entry.data)}</pre>
          </article>
        ))}
      </div>
    </div>
  );
}

function formatJson(data: unknown): string {
  try {
    if (data === undefined) return 'null';
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}
