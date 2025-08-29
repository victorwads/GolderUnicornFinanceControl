import React from 'react';
import { Link } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';
import JSZip from 'jszip';

import getRepositories, { Repositories } from '@repositories';
import { DocumentModel } from '@models';
import { Progress, SettingsSection } from './types';

const AccountContent = () => {
  const [progress, setProgress] = React.useState<Progress | null>(null);
  
  const exportData = async () => {
    if (!window.confirm(Lang.settings.exportData)) return;
    const allRepos = getRepositories();
    const zip = new JSZip();
    let prog: Progress = { current: 0, max: Object.keys(allRepos).length, filename: '', type: 'export' };
    setProgress(prog);
    for (const key in allRepos) {
      prog = { ...prog, current: prog.current + 1, filename: key };
      setProgress({ ...prog });
      const repo = allRepos[key as keyof Repositories];
      await repo.waitUntilReady();
      const data = await repo.getAll();
      zip.file(key + '.json', JSON.stringify(data, null, 2));
      zip.file(key + '.csv', toCSV(data));
    }
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'exported_data.zip';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setProgress(null);
  };

  return <>
    <div className='list'>
      <Link to="/main/resource-usage">Ver uso de recursos</Link>
      <a onClick={exportData}>{Lang.settings.exportData}</a>
      <a onClick={() => signOut(getAuth())}>{Lang.settings.logout}</a>
    </div>
    {progress && <div className="progress-box">
      <div className="progress-label">
        {progress.type === 'resave'
          ? Lang.settings.resavingWithEncryption(progress.filename, progress.current.toString(), progress.max.toString())
          : Lang.settings.exportingData(progress.filename, progress.current.toString(), progress.max.toString())}
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
