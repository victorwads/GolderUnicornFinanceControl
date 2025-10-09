import "./ResourceUsageScreen.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import { ResourcesUseModel, ResourceUsage, ResourceUseChannel } from "@resourceUse";
import getRepositories from "@repositories";

import { Container, ContainerScrollContent } from "@components/conteiners";
import ResourceUsageView from "./ResourceUsageView";
import { getCurrentMonthAiCostBRL, MONTHLY_AI_COST_LIMIT_BRL } from "../../assistant/costControl";

const users: { uid: string, email: string }[] = JSON.parse(localStorage.getItem("ACCOUNTS") || '[]');
function getInfo(userId: string) {
  return users.find(user => user.uid === userId)?.email || userId;
}

const ResourceUsageScreen: React.FC = () => {
  
  const [usersUsages, setUsersUsages] = React.useState<ResourcesUseModel[]>([]);
  const [usage, setUsage] = React.useState<ResourceUsage>(getRepositories().resourcesUse.currentUse);
  const [monthlyAiCostBRL, setMonthlyAiCostBRL] = React.useState(0);

  useEffect(() => {
    getRepositories().resourcesUse.getAllUsersUsage().then(setUsersUsages)
  }, [setUsersUsages]);

  useEffect(() => {
    const repo = getRepositories().resourcesUse
    const unsubscribe = ResourceUseChannel.subscribe(() => {
      setUsage({...repo.currentUse});
    });
    return unsubscribe;
  }, [setUsersUsages, setUsage]);

  useEffect(() => {
    const aiCallsRepo = getRepositories().aiCalls;
    let cancelled = false;

    const updateMonthlyCost = () =>
      getCurrentMonthAiCostBRL()
        .then((value) => {
          if (!cancelled) setMonthlyAiCostBRL(Number(value.toFixed(2)));
        })
        .catch(() => {
          if (!cancelled) setMonthlyAiCostBRL(0);
        });

    updateMonthlyCost();
    const unsubscribe = aiCallsRepo.addUpdatedEventListenner(() => {
      updateMonthlyCost();
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  console.log("ResourceUsageScreen rendered");
  return (
    <Container spaced className="ResourceUsageScreen">
      <ContainerScrollContent>
        <ResourceUsageView
          usage={usage}
          title="Resources Usages (Beta)"
          monthlyAiCostBRL={monthlyAiCostBRL}
          monthlyAiCostLimitBRL={MONTHLY_AI_COST_LIMIT_BRL}
        />
        {usersUsages.map(userUsage => 
          <ResourceUsageView usage={userUsage.use} title={"User " + getInfo(userUsage.id)} hide />
        )}
        <p>
          <Link to="/settings" className="back-link">
            Voltar
          </Link>
        </p>
      </ContainerScrollContent>
    </Container>
  );
};

export default ResourceUsageScreen;
