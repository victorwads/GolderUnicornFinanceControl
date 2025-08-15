import "./ResourceUsageScreen.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import getRepositories from "@repositories";
import { getCurrentCosts, ResourceUsage, ResourcesUseModel } from "@resourceUse";

import { Container, ContainerScrollContent } from "@components/conteiners";

const ResourceUsageScreen: React.FC = () => {
  
  const [usersUsages, setUsersUsages] = React.useState<ResourcesUseModel[]>([]);
  const usage = getRepositories().resourcesUse.currentUse;

  useEffect(() => {
    getRepositories().resourcesUse.getAllUsersUsage().then(setUsersUsages)
  }, [setUsersUsages]);

  return (
    <Container spaced className="ResourceUsageScreen">
      <ContainerScrollContent>
        {!usersUsages.length && <ResourceUsageView usage={usage} title="Resources Usages (Beta)" />}
        {usersUsages.map(userUsage => 
          <ResourceUsageView usage={userUsage.use} title={"User " + userUsage.id} />
        )}
      </ContainerScrollContent>
    </Container>
  );
};

const ResourceUsageView: React.FC<{ 
  usage?: ResourceUsage
  title: string
}> = ({ usage, title }) => {
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
    <section className="database-usage">
      <h3>Database</h3>
      <div className="cards-grid">
        {Object.entries(usage.db || {}).map(([key, item]) => {
          const label = key.charAt(0).toUpperCase() + key.slice(1);
          return (
            <div key={key} className="card">
              <div className="card-header">
                <span className="card-title">{label}</span>
                <span className="badge">DB</span>
              </div>
              <div className="metrics">
                <div className="metric">
                  <span className="metric-label">Reads</span>
                  <span className="metric-value">{item.docReads}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Writes</span>
                  <span className="metric-value">{item.writes}</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Query Reads</span>
                  <span className="metric-value">{item.queryReads}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
    <section className="ai-section">
      <h3>AI Models</h3>
      {aiEntries.length === 0 ? (
        <p>Sem dados de uso de IA.</p>
      ) : (
        <>
          <div>
            <div>
              <span>Total Requests</span>
              <span>{aiTotals.requests}</span>
            </div>
            <div>
              <span>Tokens Input</span>
              <span>{aiTotals.input}</span>
            </div>
            <div>
              <span>Tokens Output</span>
              <span>{aiTotals.output}</span>
            </div>
            <div>
              <span>Estimated Cost</span>
              <span>R$ {(currentCosts.dolars * 5.6).toFixed(6)}</span>
            </div>             
          </div>
          <div>
            {aiEntries.map(([name, stats]) => (
              <div key={name}>
                <div>
                  <span>{name}</span>
                  <span>AI</span>
                </div>
                <div>
                  <div>
                    <span>Requests</span>
                    <span>{stats?.requests ?? 0}</span>
                  </div>
                  <div>
                    <span>Tokens In</span>
                    <span>{stats?.input ?? 0}</span>
                  </div>
                  <div>
                    <span>Tokens Out</span>
                    <span>{stats?.output ?? 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
    <p>
      <Link to="/main/settings" className="back-link">
        Voltar
      </Link>
    </p>
  </>
};

export default ResourceUsageScreen;
