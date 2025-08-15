import { getCurrentCosts, ResourceUsage } from "@resourceUse";
import Metric from "./Metric";
import MetricCard from "./MetricCard";

const ResourceUsageView: React.FC<{ 
  usage?: ResourceUsage
  title: string
  hide?: boolean
}> = ({ usage, title, hide = false }) => {
  const currentCosts = getCurrentCosts(usage?.ai);
  const aiEntries = Object.entries(usage?.ai || {});
  const aiTotals = aiEntries.reduce(
    (acc, [, s]) => {
      acc.requests += s?.requests ?? 0;
      acc.input += s?.input ?? 0;
      acc.output += s?.output ?? 0;
      return acc;
    },
    { requests: 0, input: 0, output: 0 }
  );


  return <>
    <h2>{title}</h2>
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
            <Metric label="Estimated Cost" value={`R$ ${(currentCosts.dolars * 5.6).toFixed(4)}`} />
          </div>
        </>
      )}
    </section>
  </>
};

export default ResourceUsageView;
