import "./SettingsScreen.css";
import { useMemo } from "react";

import { Container, ContainerFixedContent, ContainerScrollContent } from "@containers";
import Card from "@componentsDeprecated/visual/Card";

import FinancesSection from './sections/QuickAccessSection';
import AppSection from './sections/AppPreferencesSection';
import AccountSection from './sections/AccountSection';
import DevSection from './sections/DevSection';
import PreferencesSection from './sections/PreferencesSection';
import VoicePreferencesSection from './sections/VoicePreferencesSection';
import { SettingsSection } from './sections/types';
import AppInfoSection from './sections/AppInfoSection';


const DevOptions = window.isDevelopment;

const SettingsScreen = () => {

  const sections: SettingsSection[] = useMemo(() => ([
    FinancesSection,
    PreferencesSection,
    AccountSection,
    VoicePreferencesSection,
    AppSection,
    AppInfoSection,
  ].concat(
    DevOptions ? [DevSection] : []
  )), []);

  return <Container spaced className="SettingsScreen">
      <ContainerFixedContent>
        <header className="settings-header">
          <h2>{Lang.settings.title}</h2>
          <nav className="settings-nav">
            {sections.map(s => <a key={s.id} href={`#${s.id}`}>{s.title}</a>)}
          </nav>
        </header>
      </ContainerFixedContent>
      <ContainerScrollContent>
        <div className="settings-grid">
          {sections.map(section => <Card key={section.id}>
            <h3 id={section.id}>{section.title}</h3>
            {section.content}
          </Card>)}
        </div>
    </ContainerScrollContent>
  </Container>;
}

export default SettingsScreen

// (vitrine) Nenhuma lógica aqui
