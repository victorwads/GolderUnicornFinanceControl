import { SettingsSection, Progress } from './types';
import getRepositories from '@repositories';
import RepositoryWithCrypt from '../../../../data/repositories/RepositoryWithCrypt';
import React from 'react';
import { Link } from 'react-router-dom';
import { setCompletedOnboarding } from '@components/voice/AIMicrophoneOnboarding.model';

const CHUNK_SIZE = 100;

const DevContent = () => {
  const [encryptionDisabled, setEncryptionDisabled] = React.useState<boolean>(localStorage.getItem('disableEncryption') === 'true');
  const [progress, setProgress] = React.useState<Progress | null>(null);

  const toggleEncryption = async () => {
    const newValue = !encryptionDisabled;
    localStorage.setItem('disableEncryption', newValue ? 'true' : 'false');
    setEncryptionDisabled(newValue);
    const allRepos = getRepositories();
    const repos = Object.entries(allRepos).filter(([, repo]) => repo instanceof RepositoryWithCrypt);
    let prog: Progress = { current: 0, max: repos.length, filename: '', type: 'resave' };
    setProgress(prog);
    for (const [key, repo] of repos) {
      const all: unknown[] = (repo as any).getCache();
      prog.filename = key;
      prog.sub = { current: 0, max: all.length };
      setProgress({ ...prog });
      while (prog.sub.current < all.length) {
        const chunk = all.slice(prog.sub.current, prog.sub.current + CHUNK_SIZE);
        await (repo as any).saveAll(chunk);
        prog.sub.current += chunk.length;
        setProgress({ ...prog });
      }
      prog.current += 1;
      setProgress({ ...prog });
    }
    setProgress(null);
  };

  if(!window.isDevelopment) return null;

  return <>
    <div className='list'>
      <Link to="/settings/ai-calls">AI Calls</Link>
      <a onClick={() => setCompletedOnboarding(false)}>{Lang.settings.resetOnboarding}</a>
      <a onClick={toggleEncryption}>{Lang.settings.toggleEncryption(encryptionDisabled)}</a>
    </div>
    {progress && <div className="progress-box">
      <div className="progress-label">
        {progress.type === 'resave'
          ? Lang.settings.resavingWithEncryption(progress.filename, progress.current.toString(), progress.max.toString())
          : ''}
      </div>
      <progress value={progress.current} max={progress.max} />
      {progress.sub && <>
        <div className="progress-sub">{progress.sub.current}/{progress.sub.max}</div>
        <progress value={progress.sub.current} max={progress.sub.max} />
      </>}
    </div>}
  </>;
};

const section: SettingsSection = {
  id: 'dev',
  title: 'Dev',
  content: <DevContent />
};

export default section;
