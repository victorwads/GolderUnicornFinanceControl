import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loading } from '@components/Loading';
import { RepoName, waitUntilReady } from '@repositories';

interface WithRepoProps {
  names: RepoName[];
  onReady?: () => void;
  children: React.ReactNode;
}

export const WithRepo: React.FC<WithRepoProps> = ({ names, children, onReady }) => {
  const [loading, setLoading] = useState(true);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
    if(!loading) onReadyRef.current?.();
  }, [onReady, loading]);

  useEffect(() => {
    let cancelled = false;
    const unsubscribe = () => {cancelled = true}

    if (names.length === 0) {
      setLoading(false);
      return unsubscribe;
    }

    setLoading(true);
    waitUntilReady(...names).finally(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Loading show={loading} />
        {Lang.commons.loading}
      </div>
    );
  }
  if (window.isDevelopment) console.log("WithRepo ready for ", names);
  return <>{children}</>;
};

export function withRepos(Component: React.ReactElement, ...names: RepoName[]) {
  return <WithRepo names={names}>{Component}</WithRepo>;
}
