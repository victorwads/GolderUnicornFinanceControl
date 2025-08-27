import { useState } from 'react';
import { SettingsSection } from './types';
import { getServices } from '@services';

const TimelinePreferences = () => {
  const { period } = getServices().timeline;
  const [mode, setMode] = useState(period.getDisplayType());
  const [day, setDay] = useState(period.getCutOffDay());

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as 'start' | 'next';
    setMode(newMode);
    period.setConfig({ displayType: newMode });
    localStorage.setItem('financeMode', newMode);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = parseInt(e.target.value, 10);
    setDay(newDay);
    period.setConfig({ cutOffDay: newDay });
    localStorage.setItem('financeDay', String(newDay));
  };

  return <div className="TimelineSettings">
    <div>
      <strong>{Lang.settings.timelineMode}</strong>
      <select value={mode} onChange={handleModeChange}>
        <option value="start">{Lang.settings.timelineModeStart}</option>
        <option value="next">{Lang.settings.timelineModeNext}</option>
      </select>
    </div>
    <div>
      <strong>{Lang.settings.timelineCutoffDay}</strong>
      <select value={day} onChange={handleDayChange}>
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
  </div>;
};

const section: SettingsSection = {
  id: 'preferences',
  title: 'Preferências',
  content: <TimelinePreferences />
};

export default section;
