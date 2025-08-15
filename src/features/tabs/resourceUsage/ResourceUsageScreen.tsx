import "./ResourceUsageScreen.css";
import React, { useEffect } from "react";
import { Link } from "react-router-dom";

import { ResourcesUseModel, ResourceUsage, ResourceUseChannel } from "@resourceUse";
import getRepositories from "@repositories";

import { Container, ContainerScrollContent } from "@components/conteiners";
import ResourceUsageView from "./ResourceUsageView";
import { UniqueIdShortener } from "@utils/UniqueIdShortener";

const ResourceUsageScreen: React.FC = () => {
  
  const [usersUsages, setUsersUsages] = React.useState<ResourcesUseModel[]>([]);
  const [usage, setUsage] = React.useState<ResourceUsage>(getRepositories().resourcesUse.currentUse);

  useEffect(() => {
    getRepositories().resourcesUse.getAllUsersUsage().then((usages) => {
      const shortener = new UniqueIdShortener(usages);
      setUsersUsages(shortener.shorten());
    })
  }, [setUsersUsages]);

  useEffect(() => {
    const repo = getRepositories().resourcesUse
    const unsubscribe = ResourceUseChannel.subscribe(() => {
      setUsage({...repo.currentUse});
    });
    return unsubscribe;
  }, [setUsersUsages, setUsage]);

  console.log("ResourceUsageScreen rendered");
  return (
    <Container spaced className="ResourceUsageScreen">
      <ContainerScrollContent>
        <ResourceUsageView usage={usage} title="Resources Usages (Beta)" />
        {usersUsages.map(userUsage => 
          <ResourceUsageView usage={userUsage.use} title={"User " + userUsage.id} hide />
        )}
        <p>
          <Link to="/main/settings" className="back-link">
            Voltar
          </Link>
        </p>
      </ContainerScrollContent>
    </Container>
  );
};

export default ResourceUsageScreen;
