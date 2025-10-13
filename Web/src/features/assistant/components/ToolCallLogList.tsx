import type { AssistantToolCallLog } from '../tools/types';

interface ToolCallLogListProps {
  calls: AssistantToolCallLog[];
}

export default function ToolCallLogList({ calls }: ToolCallLogListProps) {
  if (!calls.length) {
    return <div className="assistant-log-empty">Nenhuma tool executada ainda.</div>;
  }

  return (
    <div className="assistant-log-list">
      {calls.map((call) => (
        <div key={`${call.id}-${call.executedAt}`} className="assistant-log-item">
          <div className="assistant-log-item__header">
            <span className="assistant-log-item__name">{call.name}</span>
          </div>
          <div className="assistant-log-item__timestamp">
            {new Date(call.executedAt).toLocaleTimeString()}
          </div>
          <div className="assistant-log-item__section">
            <span className="assistant-log-item__label">Args</span>
            <pre className="assistant-log-item__pre">{JSON.stringify(call.arguments, null, 2)}</pre>
          </div>
          <div className="assistant-log-item__section">
            <span className="assistant-log-item__label">Resultado</span>
            <pre className="assistant-log-item__pre">{JSON.stringify(call.result ?? {}, null, 2)}</pre>
          </div>
        </div>
      ))}
    </div>
  );
}
