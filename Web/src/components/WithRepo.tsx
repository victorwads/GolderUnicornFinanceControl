import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loading } from '@components/Loading';
import { isAllReady, RepoName, waitUntilReady } from '@repositories';

interface WithRepoProps {
  names: RepoName[];
  onReady?: () => void;
  children: React.ReactNode;
}

export const WithRepo: React.FC<WithRepoProps> = ({ names, children, onReady }) => {
  const [loading, setLoading] = useState(!isAllReady(...names));
  const list = names.join(',');

  useEffect(() => {
    if (!loading || names.length === 0) {
      onReady?.();
      return;
    };

    let cancelled = false;
    const unsubscribe = () => {cancelled = true}

    setLoading(true);
    waitUntilReady(...names).finally(() => {
      if (cancelled) return;
      setLoading(false);
      onReady?.();
      console.log("WithRepo ready for", list);
    });

    return unsubscribe;
  }, [list, onReady]);

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
