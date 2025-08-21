import React, { useEffect, useState } from 'react';
import { Loading } from '@components/Loading';
import { RepoName, waitUntilReady } from '@repositories';

interface WithRepoProps {
  names: RepoName[];
  onReady?: () => void;
  children: React.ReactNode;
}

export const WithRepo: React.FC<WithRepoProps> = ({ names, children, onReady }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    waitUntilReady(...names).finally(() => {
        setLoading(false);
        onReady?.();
    });
  }, [names]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loading show={loading} />
        {Lang.commons.loading}
      </div>
    );
  }
  return <>{children}</>;
};

export function withRepos(Component: React.ReactElement, ...names: RepoName[]) {
  return <WithRepo names={names}>{Component}</WithRepo>;
}
