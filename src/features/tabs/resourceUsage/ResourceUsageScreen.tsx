import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container, ContainerScrollContent } from '@components/conteiners';
import getRepositories, { User } from '@repositories';
import AIResourceUsage from '../../resourceUsage/AIResourceUsage';

const ResourceUsageScreen: React.FC = () => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    getRepositories().user.getUserData().then((u) => setUser(u));
  }, []);

  return (
    <Container spaced className="ResourceUsageScreen">
      <ContainerScrollContent>
        <h2>Resources Use (Beta)</h2>
        {user?.dbUse ? (
          <>
            <div>
              Remote → Reads: {user.dbUse?.db?.remote?.docReads}, Writes: {user.dbUse?.db?.remote?.writes}, QueryReads: {user.dbUse?.db?.remote?.queryReads}
            </div>
            <div>
              Cache → Reads: {user.dbUse?.db?.cache?.docReads}, Writes: {user.dbUse?.db?.cache?.writes}, QueryReads: {user.dbUse?.db?.cache?.queryReads}
            </div>
            <div>
              Local → Reads: {user.dbUse?.db?.local?.docReads}, Writes: {user.dbUse?.db?.local?.writes}, QueryReads: {user.dbUse.local?.queryReads}
            </div>
            <AIResourceUsage data={user.dbUse.ai} />
          </>
        ) : (
          <div>Carregando uso de recursos...</div>
        )}
        <Link to="/main/settings">Voltar</Link>
      </ContainerScrollContent>
    </Container>
  );
};

export default ResourceUsageScreen;
