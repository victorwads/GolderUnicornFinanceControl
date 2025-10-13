import { AiCallContext, AIUse } from "@models";
import { ResourceUsage } from "@resourceUse";
import Metric from "./Metric";
import MetricCard from "./MetricCard";
import { USD_TO_BRL } from "../../../data/constants/currency";

const ResourceUsageView: React.FC<{ 
  usage?: ResourceUsage
  title: string
  hide?: boolean
  monthlyAiCostBRL?: number
  monthlyAiCostLimitBRL?: number
}> = ({
  usage,
  title,
  hide = false,
  monthlyAiCostBRL,
  monthlyAiCostLimitBRL,
}) => {
  const currentCosts = AiCallContext.getCurrentCosts(usage?.ai);
  const aiEntries = Object.entries(usage?.ai || {}) as [string, AIUse][];
  const aiTotals = aiEntries.reduce(
    (acc, [, s]) => {
      acc.requests += s?.requests ?? 0;
      acc.input += s?.input ?? 0;
      acc.output += s?.output ?? 0;
      return acc;
    },
    { requests: 0, input: 0, output: 0 }
  );

  const showMonthlyUsage = !hide
    && typeof monthlyAiCostBRL === "number"
    && typeof monthlyAiCostLimitBRL === "number";
  const monthlyUsageExceeded =
    showMonthlyUsage && monthlyAiCostBRL! > monthlyAiCostLimitBRL!;
  const monthlyProgressValue = showMonthlyUsage
    ? Math.min(monthlyAiCostBRL!, monthlyAiCostLimitBRL!)
    : 0;
  const estimatedCostBRL = currentCosts.dolars * USD_TO_BRL;

  return <>
    <h2>{title}</h2>
    {showMonthlyUsage && (
      <div className={`resource-use-progress${monthlyUsageExceeded ? " is-exceeded" : ""}`}>
        <div className="resource-use-progress__info">
          <strong>Consumo mensal de IA</strong>
          <span>
            {`${formatCurrencyBRL(monthlyAiCostBRL!)} de ${formatCurrencyBRL(monthlyAiCostLimitBRL!)}`}
          </span>
        </div>
        <progress value={monthlyProgressValue} max={monthlyAiCostLimitBRL} />
        {monthlyUsageExceeded && (
          <span className="resource-use-progress__warning">
            Limite excedido em {formatCurrencyBRL(monthlyAiCostBRL! - monthlyAiCostLimitBRL!)}
          </span>
        )}
      </div>
    )}
    <section className="resource-use-section">
      {!hide && <h3>Database</h3>}
      <div className="cards-grid">
        {Object.entries(usage?.db || {}).map(([key, item]) => <MetricCard key={key} metrics={{
            "Reads": item.docReads,
            "Writes": item.writes,
            "Query Reads": item.queryReads
        }} type="DB" label={key.charAt(0).toUpperCase() + key.slice(1)} />)}
      </div>
    </section>
    <section className="resource-use-section">
      {aiEntries.length === 0 ? (
        <p>Sem dados de uso de IA.</p>
      ) : (
        <>
          {!hide && <h3>AI Models</h3>}
          <div className="cards-grid">
            {aiEntries.map(([name, stats]) => <MetricCard metrics={{
              "Requests": stats?.requests,
              "Tokens In": stats?.input,
              "Tokens Out": stats?.output
            }} type="IA" label={name} />)}
          </div>
          <p></p>
          <div className="cards-grid quad">
            <Metric label="Total Requests" value={aiTotals.requests} />
            <Metric label="Tokens Input" value={aiTotals.input} />
            <Metric label="Tokens Output" value={aiTotals.output} />
            <Metric label="Estimated Cost" value={formatCurrencyBRL(estimatedCostBRL)} />
          </div>
        </>
      )}
    </section>
  </>
};

export default ResourceUsageView;

function formatCurrencyBRL(value: number): string {
  if (!Number.isFinite(value)) return "R$\u00a00,00";
  return value.toLocaleString(CurrentLangInfo.short, {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: value > 1 ? 2 : 4,
    maximumFractionDigits: 4,
  });
}
