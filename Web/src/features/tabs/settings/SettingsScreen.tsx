import "./SettingsScreen.css";
import { useMemo } from "react";

import { Container, ContainerFixedContent, ContainerScrollContent } from "@components/conteiners";
import Card from "@components/visual/Card";
import FinancesSection from './sections/QuickAccessSection';
import AppSection from './sections/AppPreferencesSection';
import AccountSection from './sections/AccountSection';
import BetaSection from './sections/BetaSection';
import DevSection from './sections/DevSection';
import PreferencesSection from './sections/PreferencesSection';
import { SettingsSection } from './sections/types';
import AppInfoSection from './sections/AppInfoSection';

const SettingsScreen = () => {

  const sections: SettingsSection[] = useMemo(() => ([
    FinancesSection,
    AccountSection,
    PreferencesSection,
    AppInfoSection,
    AppSection,
    BetaSection,
    DevSection,
  ]), []);

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
