import { Langs, setLanguage } from '../../../../i18n';
import { Density, Theme, useCssVars } from '@components/Vars';
import { useState } from 'react';
import { SettingsSection } from './types';

const PreferencesContent = () => {
  const { theme, setTheme, density, setDensity } = useCssVars();
  const [language, setCurrentLanguage] = useState<string>(SavedLang || '');
  return <div className="ThemeSettings">
    <div>
      <strong>{Lang.settings.theme}</strong>
      <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
        <option value="theme-light">{Lang.settings.theme} Light</option>
        <option value="theme-dark">{Lang.settings.theme} Dark</option>
      </select>
    </div>
    <div>
      <strong>{Lang.settings.density}</strong>
      <select value={density} onChange={(e) => setDensity(e.target.value as Density)}>
        <option value="density-1">{Lang.settings.density} 1</option>
        <option value="density-2">{Lang.settings.density} 2</option>
        <option value="density-3">{Lang.settings.density} 3</option>
        <option value="density-4">{Lang.settings.density} 4</option>
      </select>
    </div>
    <div>
      <strong>{Lang.settings.language}</strong>
      <select value={language} onChange={(e) => { setLanguage(e.target.value as any); setCurrentLanguage(SavedLang || ''); }}>
        <option key="" value="">{Lang.commons.default} ({navigator.language})</option>
        {Object.keys(Langs).map((key) => <option key={key} value={key}>{Langs[key as keyof typeof Langs].name}</option>)}
      </select>
    </div>
  </div>;
};

const section: SettingsSection = {
  id: 'app',
  title: 'Aparência',
  content: <PreferencesContent />
};

export default section;
