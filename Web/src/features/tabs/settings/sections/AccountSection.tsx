import React from 'react';
import { Link } from 'react-router-dom';
import JSZip from 'jszip';

import getRepositories, { RepoName, Repositories } from '@repositories';
import { DocumentModel } from '@models';
import { Progress, SettingsSection } from './types';
import { clearSession } from '@utils/clearSession';
import { getCurrentUser } from '@configs';

const DOWNLOAD_FILENAME = 'exported_data.zip';

const AccountContent = () => {
  const [progress, setProgress] = React.useState<Progress | null>(null);

  const runExport = React.useCallback(async ({ skipConfirm = false }: { skipConfirm?: boolean } = {}) => {
    if (!skipConfirm && !window.confirm(Lang.settings.exportData)) return false;

    const allRepos = getRepositories();
    const repoKeys = Object.keys(allRepos) as RepoName[];
    const zip = new JSZip();
    let currentProgress: Progress = { current: 0, max: repoKeys.length, filename: '', type: 'export' };

    const emitProgress = (overrides?: Partial<Progress>) => {
      currentProgress = { ...currentProgress, ...overrides };
      setProgress({ ...currentProgress });
    };

    emitProgress();

    try {
      for (const key of repoKeys) {
        const repo = allRepos[key];
        emitProgress({ filename: key });
        try {
          if (!repo.isReady) await repo.waitUntilReady();
          const data = await repo.getAll();
          zip.file(`${key}.json`, JSON.stringify(data, null, 2));
          zip.file(`${key}.csv`, toCSV(data));
        } catch (error) {
          console.error('Failed to export repository', key, error);
          throw error;
        }
        emitProgress({ current: currentProgress.current + 1 });
      }

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = DOWNLOAD_FILENAME;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);

      return true;
    } catch (error) {
      window.alert(Lang.settings.exportDataError);
      return false;
    } finally {
      setProgress(null);
    }
  }, []);

  const handleExportClick = React.useCallback(async () => {
    if (progress) return;
    await runExport();
  }, [progress, runExport]);

  const handleDeleteData = React.useCallback(async () => {
    if (progress) return;

    if (!window.confirm(Lang.settings.deleteDataConfirm)) return;
    const phrases = Lang.settings.deleteDataPhrases();
    const phrase = phrases[Math.floor(Math.random() * phrases.length)] || phrases[0] || Lang.settings.deleteData;
    const typed = window.prompt(Lang.settings.deleteDataPrompt(phrase));
    if ((typed ?? '').trim() !== phrase) {
      window.alert(Lang.settings.deleteDataMismatch);
      return;
    }

    const exported = await runExport({ skipConfirm: true });
    if (!exported) return;

    const ignored: RepoName[] = ['banks'];
    const entries = Object.entries(getRepositories())
      .filter(
        ([key]) => !ignored.includes(key as RepoName)
    ) as [RepoName, Repositories[RepoName]][];
    let currentProgress: Progress = { current: 0, max: entries.length, filename: '', type: 'delete' };

    const emitProgress = (overrides?: Partial<Progress>) => {
      currentProgress = { ...currentProgress, ...overrides };
      setProgress({ ...currentProgress });
    };

    emitProgress();

    try {
      for (const [key, repo] of entries) {
        emitProgress({ filename: key, sub: undefined });
        await repo.deleteAll();
        emitProgress({ current: currentProgress.current + 1 });
      }
      window.alert(Lang.settings.deleteDataSuccess);
      await clearSession();
    } catch (error) {
      console.error('Failed to delete user data', error);
      window.alert(Lang.settings.deleteDataError);
    } finally {
      setProgress(null);
    }
  }, [progress, runExport]);

  return <>
    <div className='list'>
      <Link to="/resource-usage">Ver uso de recursos</Link>
      <a onClick={handleExportClick}>{Lang.settings.exportData}</a>
      <a onClick={() => clearSession()}>{Lang.settings.logout}</a>
    </div>
    {progress && <div className="progress-box">
      <div className="progress-label">
        {progress.type === 'resave'
          ? Lang.settings.resavingWithEncryption(progress.filename, progress.current.toString(), progress.max.toString())
          : progress.type === 'delete'
            ? Lang.settings.deletingData(progress.filename, progress.current.toString(), progress.max.toString())
            : Lang.settings.exportingData(progress.filename, progress.current.toString(), progress.max.toString())}
      </div>
      <progress value={progress.current} max={progress.max} />
      {progress.sub && <>
        <div className="progress-sub">{progress.sub.current}/{progress.sub.max}</div>
        <progress value={progress.sub.current} max={progress.sub.max} />
      </>}
    </div>}
    <p>My id: {getCurrentUser()?.uid}</p>
    <div className='list'>
      <a onClick={handleDeleteData}>{Lang.settings.deleteData}</a>
    </div>
  </>;
};

const section: SettingsSection = {
  id: 'myData',
  title: Lang.settings.myData,
  content: <AccountContent />
};

export default section;

function toCSV(data: DocumentModel[]): string {
  const headers = data.reduce((acc, item) => {
    Object.keys(item).forEach(k => { if (!acc.includes(k)) acc.push(k); });
    return acc;
  }, [] as string[]);
  const csvRows = [headers.join(',')];
  data.forEach(item => {
    const values = headers.map(h => JSON.stringify(item[h as keyof DocumentModel])?.replace(',', ';'));
    csvRows.push(values.join(','));
  });
    return csvRows.join('\n');
}
