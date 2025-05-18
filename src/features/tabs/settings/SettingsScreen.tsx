import "./SettingsScreen.css"
import JSZip from "jszip";
import { getAuth, signOut } from "firebase/auth"
import { useEffect, useState } from "react"
import { Link } from "react-router-dom"

import getRepositories, { Repositories } from "../../../data/repositories";
import { User } from "../../../data/repositories/UserRepository";
import { useCssVars, Theme, Density } from '../../../components/Vars';
import DocumentModel from "../../../data/models/DocumentModel";
import { Container, ContainerScrollContent } from "../../../components/conteiners";

interface ExportProgress {
  filename: string;
  current: number;
  max: number;
}

const SettingsScreen = () => {

  const [user, setUser] = useState<User>()
  const { theme, setTheme, density, setDensity } = useCssVars();
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);

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
    if (!window.confirm('Você tem certeza que deseja exportar seus dados? Varios arquivos serão baixados.'))
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
    <h2>Settings Screen</h2>
    <h3>Data</h3>
    <ul>
      <li><Link to={'/categories'}>Categorias</Link></li>
      <li><Link to={'/accounts'}>Contas</Link></li>
      <li><Link to={'/creditcards'}>Cartões</Link></li>
    </ul>
    <h3>Privacy</h3>
    <ul>
      <li onClick={() => exportData()}>Exportar Meus Dados</li>
      {exportProgress && <div>
        <div>Exportando {exportProgress.filename} ({exportProgress.current}/{exportProgress.max})%</div>
        <progress value={exportProgress.current} max={exportProgress.max} />
      </div>}
    </ul>
    <h3>Database Usage</h3>
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
      <div>Loading database usage...</div>
    )}

    <div className="ThemeSettings">
      <div>
        <h3>Theme</h3>
        <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
          <option value="theme-light">Light</option>
          <option value="theme-dark">Dark</option>
        </select>
      </div>

      <div>
        <h3>Density</h3>
        <select value={density} onChange={(e) => setDensity(e.target.value as Density)}>
          <option value="density-1">Density 1</option>
          <option value="density-2">Density 2</option>
          <option value="density-3">Density 3</option>
          <option value="density-4">Density 4</option>
        </select>
      </div>
    </div>

    <h3>Auth</h3>
    <a onClick={() => signOut(getAuth())}>Encerrar Sessão / Deslogar</a>
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


