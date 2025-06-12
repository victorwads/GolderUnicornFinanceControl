import "./SettingsScreen.css"
import JSZip from "jszip";
import { getAuth, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import { Langs, setLanguage } from "../../../i18n";
import { clearFirestore } from "../../../data/firebase/google-services";

import { DocumentModel } from "@models";
import getRepositories, { Repositories, User } from "@repositories";

import { useCssVars, Theme, Density } from '@components/Vars';
import { Container, ContainerScrollContent } from "@components/conteiners";

interface ExportProgress {
  filename: string;
  current: number;
  max: number;
}

const SettingsScreen = () => {

  const { theme, setTheme, density, setDensity } = useCssVars();
  const [user, setUser] = useState<User>()
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [language, setCurrentLanguage] = useState<string>(SavedLang || "");

  useEffect(() => {
    getRepositories().user.getUserData().then((user) => {
      setUser(user)
    });
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme)
    localStorage.setItem('density', density)
  }, [theme, density]);

  const exportData = async () => {
    if (!window.confirm(Lang.settings.exportData))
      return;

    const allRepos = getRepositories();
    const zip = new JSZip();

    let progress = {
      current: 0,
      max: Object.keys(allRepos).length,
      filename: ''
    };
    setExportProgress(progress);

    for (const key in allRepos) {
      progress = { ...progress, current: progress.current + 1, filename: key }
      setExportProgress(progress);

      const repo = allRepos[key as keyof Repositories];
      const data = await repo.getAll();
      zip.file(key + '.json', JSON.stringify(data, null, 2));
      zip.file(key + '.csv', toCSV(data));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported_data.zip';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExportProgress(null);
  };

  return <Container spaced className="SettingsScreen"><ContainerScrollContent>
    <h2>{Lang.settings.title}</h2>
    <h3>{Lang.settings.data}</h3>
    <ul>
      <li><Link to={'/categories'}>{Lang.categories.title}</Link></li>
      <li><Link to={'/accounts'}>{Lang.accounts.title}</Link></li>
      <li><Link to={'/creditcards'}>{Lang.creditcards.title}</Link></li>
    </ul>
    <h3>{Lang.settings.privacy}</h3>
    <ul>
      <li onClick={() => exportData()}>{Lang.settings.exportData}</li>
      {exportProgress && <div>
        <div>{Lang.settings.exportingData(exportProgress.filename, exportProgress.current.toString(), exportProgress.max.toString())}</div>
        <progress value={exportProgress.current} max={exportProgress.max} />
      </div>}
    </ul>
    <h3>{Lang.settings.databaseUsage}</h3>
    {user?.dbUse ? (
      <div className="db-usage">
        <div>
          Remote &rarr; Reads: {user.dbUse.remote.docReads}, Writes: {user.dbUse.remote.writes}, QueryReads: {user.dbUse.remote.queryReads}
        </div>
        <div>
          Cache &rarr; Reads: {user.dbUse.cache.docReads}, Writes: {user.dbUse.cache.writes}, QueryReads: {user.dbUse.cache.queryReads}
        </div>
        <div>
          Local &rarr; Reads: {user.dbUse.local.docReads}, Writes: {user.dbUse.local.writes}, QueryReads: {user.dbUse.local.queryReads}
        </div>
      </div>
    ) : (
      <div>{Lang.settings.loadingDatabaseUsage}</div>
    )}

    <div className="ThemeSettings">
      <div>
        <h3>{Lang.settings.theme}</h3>
        <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
          <option value="theme-light">{Lang.settings.theme} Light</option>
          <option value="theme-dark">{Lang.settings.theme} Dark</option>
        </select>
      </div>

      <div>
        <h3>{Lang.settings.density}</h3>
        <select value={density} onChange={(e) => setDensity(e.target.value as Density)}>
          <option value="density-1">{Lang.settings.density} 1</option>
          <option value="density-2">{Lang.settings.density} 2</option>
          <option value="density-3">{Lang.settings.density} 3</option>
          <option value="density-4">{Lang.settings.density} 4</option>
        </select>
      </div>
    </div>

    <h3>{Lang.settings.auth}</h3>
    <div>
      <a onClick={() => signOut(getAuth())}>{Lang.settings.logout}</a>
    </div>
    <div></div>
    {window.isDevelopment && <>
      <a onClick={clearFirestore}>{Lang.settings.clearLocalCaches}</a>
    </>}
    <h3>{Lang.settings.language}</h3>
    <div>
      <select value={language} onChange={(e) => {
        setLanguage(e.target.value as any);
        setCurrentLanguage(SavedLang || "");
      }}>
        <option key="" value="">{Lang.commons.default} ({navigator.language})</option>
        {Object.keys(Langs).map((key) => {
          return <option key={key} value={key}>{Langs[key as keyof typeof Langs].name}</option>
        })}
      </select>
    </div>

  </ContainerScrollContent></Container>
}

export default SettingsScreen

function toCSV(data: DocumentModel[]): string {
  const headers = data.reduce((acc, item) => {
    const keys = Object.keys(item);
    keys.forEach((key) => {
      if (!acc.includes(key)) {
        acc.push(key);
      }
    });
    return acc;
  }, [] as string[]);

  const csvRows = [];
  csvRows.push(headers.join(','));
  data.forEach((item) => {
    const values = headers.map((header) => {
      const value = item[header as keyof DocumentModel];
      return JSON.stringify(value)?.replace(",", ";");
    });
    csvRows.push(values.join(','));
  });
  return csvRows.join('\n');
}
