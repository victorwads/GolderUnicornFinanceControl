import React from 'react';
import { Link } from 'react-router-dom';

import { ProjectStorage } from '@utils/ProjectStorage';
import getRepositories, { RepositoryWithCrypt } from '@repositories';

import { clearAIMicrophoneOnboardingFlags } from '@components/voice/AIMicrophoneOnboarding.model';
import { clearAssistantOnboardingDismissal } from '@features/assistant/utils/onboardingStorage';
import { dispatchAssistantEvent } from '@features/assistant/utils/assistantEvents';
import { SettingsSection, Progress } from './types';

const CHUNK_SIZE = 100;

const DevContent = () => {
  const [encryptionDisabled, setEncryptionDisabled] = React.useState<boolean>(ProjectStorage.get('disableEncryption') === 'true');
  const [progress, setProgress] = React.useState<Progress | null>(null);

  const killAccountRegisters = async (accountId: string) => {
    const { accountTransactions, accounts } = getRepositories();
    const all = accountTransactions.getCache(true);
    const toKill = all
      .filter((reg) => reg.accountId === accountId)
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .map((reg) => reg.id);

    const account = accounts.getLocalById(accountId);
    if (!confirm(`Are you sure you want to delete ${toKill.length} registers for account ${account?.name}? This action cannot be undone.`)) return;
    for (const id of toKill) {
      await accountTransactions.delete(id, false);
    }
    alert(`Deleted ${toKill.length} registers for account ${account?.name}.`);
  }

  const toggleEncryption = async () => {
    const newValue = !encryptionDisabled;
    ProjectStorage.set('disableEncryption', newValue ? 'true' : 'false');
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

  const resetAssistantOnboarding = async () => {
    try {
      await getRepositories().user.clearOnboardingFlag();
    } catch (error) {
      console.error('Failed to clear onboarding flag', error);
    }

    clearAssistantOnboardingDismissal();
    clearAIMicrophoneOnboardingFlags();
    dispatchAssistantEvent('assistant:onboarding-reset');
  };

  return <>
    <div className='list'>
      <Link to="/settings/ai-calls">AI Calls</Link>
      <Link to={'/subscriptions'}>Subscriptions <small>(Only Informative)</small></Link>
      <a onClick={resetAssistantOnboarding}>{Lang.settings.resetOnboarding}</a>
      <a onClick={toggleEncryption}>{Lang.settings.toggleEncryption(encryptionDisabled)}</a>
      <input type="text" style={{color: 'black'}} placeholder='Kill account registers' onKeyDown={(e) => {
        if (e.key === 'Enter' && e.currentTarget.value) {
          killAccountRegisters(e.currentTarget.value);
        }
      }} />
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
