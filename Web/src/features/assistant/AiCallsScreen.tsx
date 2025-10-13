import './AiCallsScreen.css';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Container, ContainerFixedContent, ContainerScrollContent } from '@components/conteiners';
import getRepositories, { AiCallsRepository } from '@repositories';
import { AiCallContext, AiModel } from '@models';

import {
  MONTHLY_AI_COST_LIMIT_BRL,
} from './costControl';
import { getAssistantModel, setAssistantModel, setPendingAiContext } from './AssistantController';
import { get } from 'http';

type Conversation = {
  id: string;
  title: string;
  updatedAt: number;
  context: AiCallContext;
  costBRL: number;
};

type MessageEntry = AiCallContext['history'][number] & Record<string, unknown>;

const UNTITLED = 'Conversa sem título';

const AiCallsScreen = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { userId } = useParams<{ userId?: string }>();

  useEffect(() => {
    let repo = getRepositories().aiCalls;
    if (userId) {
      repo = new AiCallsRepository();
      repo.reset(userId);
    }

    const sync = (items: AiCallContext[]) => {
      const normalized = normalizeConversations(items);
      setConversations(normalized);
      setSelectedId((previous) => {
        if (previous && normalized.some((item) => item.id === previous)) {
          return previous;
        }
        return normalized[0]?.id ?? null;
      });
    };

    repo.waitUntilReady()
    repo.getAll().then(sync).catch(() => sync(repo.getCache()));

    return repo.addUpdatedEventListenner(() => sync(repo.getCache()));
  }, [userId]);

  const selectedConversation =
    conversations.find((conversation) => conversation.id === selectedId)
  const monthlyLimitBRL = MONTHLY_AI_COST_LIMIT_BRL;
  const monthlyCostBRL = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();

    const total = conversations.reduce((accumulator, conversation) => {
      const timestamp = getConversationTimestamp(conversation.context);
      if (!Number.isFinite(timestamp)) return accumulator;
      if (timestamp < monthStart || timestamp >= monthEnd) return accumulator;
      return accumulator + conversation.costBRL;
    }, 0);
    return Number(total.toFixed(2));
  }, [conversations]);
  const exceededMonthlyLimit = monthlyCostBRL > monthlyLimitBRL;
  const progressValue = Math.min(monthlyCostBRL, monthlyLimitBRL);

  return (
    <Container screen spaced full className="AiCallsScreen">
      <ContainerFixedContent>
        <header className="AiCallsScreen__header">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>AI Calls</h2>
              <select onChange={(e) => setAssistantModel(e.target.value as AiModel)} value={getAssistantModel()}>
                {Object.keys(AiCallContext.TOKEN_PRICES).map((model) => (
                  <option value={model}>{model}</option>
                ))}
              </select>
            </div>
            <p className="AiCallsScreen__subtitle">
              Visualize os registros completos das execuções do assistente.
            </p>
          </div>
        </header>
        <div className={`AiCallsScreen__usage${exceededMonthlyLimit ? ' is-exceeded' : ''}`}>
          <div className="AiCallsScreen__usageInfo">
            <strong>Consumo mensal</strong>
            <span>
              {`${formatCurrencyBRL(monthlyCostBRL)} de ${formatCurrencyBRL(monthlyLimitBRL)}`}
            </span>
          </div>
          <progress value={progressValue} max={monthlyLimitBRL} />
          {exceededMonthlyLimit && (
            <span className="AiCallsScreen__usageWarning">
              Limite excedido em {formatCurrencyBRL(monthlyCostBRL - monthlyLimitBRL)}
            </span>
          )}
        </div>
      </ContainerFixedContent>
      <ContainerScrollContent autoScroll>
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
                    <span className="AiCallsList__model">{conversation.context.model}</span>
                    <span className="AiCallsList__time">
                      {`${formatCurrencyBRL(conversation.costBRL)} • ${formatRelativeTime(conversation.updatedAt)}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </aside>
          <section className="AiCallsThread">
            {selectedConversation ? (
              <ConversationDetails conversation={selectedConversation} />
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

function normalizeConversations(items: AiCallContext[]): Conversation[] {
  return items
    .filter((context) => context.version === 2)
    .map((context) => ({
      id: context.id,
      title: deriveTitle(context) || UNTITLED,
      updatedAt: getConversationTimestamp(context),
      context,
      costBRL: context.getCostBRL(),
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

function deriveTitle(context: AiCallContext): string {
  const history = Array.isArray(context.history) ? context.history : [];
  const userEntry = [...history].reverse().find((entry) => entry?.role === 'user');
  if (!userEntry) return '';
  const title = formatContent((userEntry as Record<string, unknown>).content).trim();
  return title && title !== 'null' ? title : '';
}

function getConversationTimestamp(context: AiCallContext): number {
  if (context.finishedAt instanceof Date) {
    return context.finishedAt.getTime();
  }
  const updatedAt = context._updatedAt instanceof Date ? context._updatedAt.getTime() : undefined;
  if (updatedAt) return updatedAt;
  const createdAt = context._createdAt instanceof Date ? context._createdAt.getTime() : undefined;
  if (createdAt) return createdAt;
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

type ConversationDetailsProps = {
  conversation: Conversation;
};

function ConversationDetails({ conversation }: ConversationDetailsProps) {
  const { context } = conversation;
  const history = getMessageEntries(context);
  const sharedDomains = Array.isArray(context.sharedDomains) ? context.sharedDomains : [];
  const warnings = Array.isArray(context.warnings) ? context.warnings : [];
  const finishedAt = context.finishedAt instanceof Date ? context.finishedAt : null;
  const createdAt = context._createdAt instanceof Date ? context._createdAt : null;
  const updatedAt = context._updatedAt instanceof Date ? context._updatedAt : null;
  const tokens = context.tokens ?? { input: 0, output: 0 };
  const costBRL = conversation.costBRL;

  return (
    <div className="AiCallsMessages">
      <header className="AiCallsMessages__header">
        <div>
          <h3>{conversation.title}</h3>
          <span>Atualizado em {new Date(conversation.updatedAt).toLocaleString()}</span>
        </div>
        <div className="AiCallsMessages__metaGrid">
          <span><strong>ID:</strong> {context.id}</span>
          <span><strong>Modelo:</strong> {context.model}</span>
          <span><strong>Tokens entrada:</strong> {tokens.input ?? 0}</span>
          <span><strong>Tokens saída:</strong> {tokens.output ?? 0}</span>
          <span><strong>Custo estimado:</strong> {formatCurrencyBRL(costBRL)}</span>
          {createdAt && <span><strong>Criado em:</strong> {createdAt.toLocaleString()}</span>}
          {updatedAt && <span><strong>Último update:</strong> {updatedAt.toLocaleString()}</span>}
          {finishedAt && <span><strong>Finalizado em:</strong> {finishedAt.toLocaleString()}</span>}
          {context.finishReason && <span><strong>Motivo de término:</strong> {context.finishReason}</span>}
        </div>
        {sharedDomains.length > 0 && (
          <div className="AiCallsMessages__tags">
            <strong>Domínios compartilhados:</strong>
            {sharedDomains.map((domain) => (
              <span key={domain} className="AiCallsMessages__tag">{domain}</span>
            ))}
          </div>
        )}
        <button onClick={() => {
          const lastMessage = history.length > 0 ? history[history.length - 1] : null;
          if (lastMessage?.role === 'assistant') {
            // remove last assistant message to avoid confusion
            context.history = context.history?.slice(0, -1);
          }
          console.log('context', context);
          setPendingAiContext(context);
          alert('Contexto da conversa carregado. Você pode iniciar o assistente para continuar a conversa.');
        }}>Continue a conversa</button>
        {warnings.length > 0 && (
          <div className="AiCallsMessages__warnings">
            <strong>Avisos</strong>
            <ul>
              {warnings.map((warning, index) => (
                <li key={`${warning}-${index}`}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
      </header>
      <div className="AiCallsMessages__list">
        {history.length === 0 ? (
          <div className="AiCallsThread__empty">Nenhum histórico disponível para esta chamada.</div>
        ) : (
          history.map((entry, index) => {
            const { content, role, ...rest } = entry ?? {};
            const extra = sanitize(rest);
            const metaItems = [
              typeof entry?.name === 'string' ? entry.name : null,
              typeof entry?.tool_call_id === 'string' ? `tool:${entry.tool_call_id}` : null,
            ].filter(Boolean);

            return (
              <article
                key={`${role ?? 'entry'}-${index}`}
                className={`AiCallsMessage AiCallsMessage--${role ?? 'unknown'}`}
              >
                <div className="AiCallsMessage__meta">
                  <span className="AiCallsMessage__role">{role ?? 'unknown'}</span>
                  {metaItems.length > 0 && (
                    <span className="AiCallsMessage__time">{metaItems.join(' · ')}</span>
                  )}
                </div>
                <pre>{formatContent(content)}</pre>
                {extra && Object.keys(extra).length > 0 && (
                  <div className="AiCallsMessage__extra">
                    <pre>{formatJson(extra)}</pre>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}

function getMessageEntries(context: AiCallContext): MessageEntry[] {
  if (!Array.isArray(context.history)) return [];
  return context.history
    .filter((entry): entry is MessageEntry => !!entry && typeof entry === 'object')
    .map((entry) => entry as MessageEntry);
}

function formatContent(content: unknown): string {
  if (typeof content === 'string') {
    try {
      const obj = JSON.parse(content);
      if (obj && typeof obj === 'object') {
        return JSON.stringify(obj, null, 2);
      }
    } catch {}
  }
  return String(content);
}

function formatJson(data: unknown): string {
  try {
    if (data === undefined) return 'null';
    return JSON.stringify(data, null, 2);
  } catch {
    return String(data);
  }
}

function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return 'R$\u00a00,00';
  return value.toLocaleString(CurrentLangInfo.short, {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: value > 1 ? 2 : 4,
    maximumFractionDigits: 4,
  });
}

function sanitize<T>(value: T): T | undefined {
  if (Array.isArray(value)) {
    return value.map(sanitize).filter((item) => item !== undefined) as T;
  }
  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).reduce<Record<string, unknown>>((acc, [key, val]) => {
      const cleaned = sanitize(val);
      if (cleaned !== undefined) {
        acc[key] = cleaned;
      }
      return acc;
    }, {});
    return (Object.keys(entries).length > 0 ? entries : undefined) as T | undefined;
  }
  return value === undefined ? undefined : value;
}
