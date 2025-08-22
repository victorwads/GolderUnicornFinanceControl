import "./SettingsScreen.css";
import JSZip from "jszip";
import { getAuth, signOut } from "firebase/auth";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { Langs, setLanguage } from "../../../i18n";
import { clearFirestore } from "../../../data/firebase/google-services";

import { DocumentModel } from "@models";
import getRepositories, { Repositories } from "@repositories";
import RepositoryWithCrypt from "../../../data/repositories/RepositoryWithCrypt";

import { useCssVars } from '@components/Vars';
import { Container, ContainerScrollContent } from "@components/conteiners";
import Card from "@components/visual/Card";
import { QuickAccessSection } from './sections/QuickAccessSection';
import { AppPreferencesSection } from './sections/AppPreferencesSection';
import { PrivacySection } from './sections/PrivacySection';
import { AccountSection } from './sections/AccountSection';
import { BetaDevSection } from './sections/BetaDevSection';
import { Progress } from './sections/types';

const CHUNK_SIZE = 100;

const SettingsScreen = () => {

  const { theme, density } = useCssVars();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [encryptionDisabled, setEncryptionDisabled] = useState<boolean>(localStorage.getItem('disableEncryption') === 'true');
  const [language, setCurrentLanguage] = useState<string>(SavedLang || "");

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
      filename: '',
      type: 'export' as const,
    };
    setProgress(progress);

    for (const key in allRepos) {
      progress = { ...progress, current: progress.current + 1, filename: key }
      setProgress(progress);

      const repo = allRepos[key as keyof Repositories];
      await repo.waitUntilReady();
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
    setProgress(null);
  };

  const toggleEncryption = async () => {
    const newValue = !encryptionDisabled;
    localStorage.setItem('disableEncryption', newValue ? 'true' : 'false');
    setEncryptionDisabled(newValue);

    const allRepos = getRepositories();
    const repos = Object.entries(allRepos).filter(([, repo]) => repo instanceof RepositoryWithCrypt);

    let progress: Progress = { current: 0, max: repos.length, filename: '', type: 'resave' };
    setProgress(progress);

    for (const [key, repo] of repos) {
      const all: unknown[] = repo.getCache();
      progress.filename = key;
      progress.sub = { current: 0, max: all.length };
      setProgress({...progress});

      while (progress.sub.current < all.length) {
        const chunk = all.slice(progress.sub.current, progress.sub.current + CHUNK_SIZE);
        await repo.saveAll(chunk as any);
        console.log(`Saved ${chunk.length} items to ${key}`);
        progress.sub.current += chunk.length;
        setProgress({...progress});
      }

      progress.current = progress.current + 1;
    }

    setProgress(null);
  };

  const sections = useMemo(() => ([
    { id: 'quick', title: 'Acesso Rápido', content: <QuickAccessSection /> },
    { id: 'app', title: 'Aplicativo', content: <AppPreferencesSection language={language} setCurrentLanguage={setCurrentLanguage} /> },
    { id: 'privacy', title: Lang.settings.privacy, content: <PrivacySection progress={progress} onExport={exportData} /> },
    { id: 'account', title: 'Minha Conta', content: <AccountSection /> },
    { id: 'beta', title: 'Beta / Dev', content: <BetaDevSection encryptionDisabled={encryptionDisabled} toggleEncryption={toggleEncryption} clearFirestore={clearFirestore} /> },
  ]), [language, progress, encryptionDisabled]);

  return <Container spaced className="SettingsScreen"><ContainerScrollContent>
    <header className="settings-header">
      <h2>{Lang.settings.title}</h2>
      <nav className="settings-nav">
        {sections.map(s => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}
      </nav>
    </header>

    <div className="settings-grid">
      {sections.map(section => <Card key={section.id}>
        <h3 id={section.id}>{section.title}</h3>
        {section.content}
      </Card>)}
    </div>
  </ContainerScrollContent></Container>;
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
