import { useState } from 'react';

import FinancialMonthPeriod from '@utils/FinancialMonthPeriod';
import { ProjectStorage } from '@utils/ProjectStorage';
import { getServices } from '@services';

import { SettingsSection } from './types';

const TimelinePreferences = () => {
  const { period } = getServices().timeline;
  const [mode, setMode] = useState(period.getDisplayType());
  const [day, setDay] = useState(period.getCutOffDay());

  const handleModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newMode = e.target.value as 'start' | 'next';
    setMode(newMode);
    period.setConfig({ displayType: newMode });
    ProjectStorage.set('financeMode', newMode);
  };

  const handleDayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDay = parseInt(e.target.value, 10);
    setDay(newDay);
    period.setConfig({ cutOffDay: newDay });
    ProjectStorage.set('financeDay', String(newDay));
  };

  const monthPeriod = new FinancialMonthPeriod(day, mode);


  const initDay = new Date();
  initDay.setDate(day);
  const initMonth = monthPeriod.getMonthForDate(initDay).monthLocaleName.cap();
  const dayLocale = initDay.toLocaleDateString(CurrentLangInfo.short, { day: 'numeric', month: 'numeric' });

  const prevDay = new Date(initDay);
  prevDay.setDate(day - 1);
  const prevMonth = monthPeriod.getMonthForDate(prevDay).monthLocaleName.cap();

  return <div className="list">
    <div>
      <strong>{Lang.settings.timelineCutoffDay}</strong>
      <select value={day} onChange={handleDayChange}>
        {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>
    </div>
    <div>
      <strong>{Lang.settings.timelineMode}</strong>
      <select value={mode} onChange={handleModeChange}>
        <option value="start">{Lang.settings.timelineModeStart(day)}</option>
        <option value="next">{Lang.settings.timelineModeNext(day)}</option>
      </select>
      <p>
        na sua Linha do tempo:<br />
        <div style={{height: 5}}></div>
        Dia {dayLocale} em diante será chamado de <strong>{initMonth}</strong>.
        <br />
        {day > 1 && <>
          E antes de {dayLocale} será chamado <strong>{prevMonth}</strong>.
          <br />
        </>}
      </p>
    </div>
  </div>;
};

const section: SettingsSection = {
  id: 'preferences',
  title: 'Timeline',
  content: <TimelinePreferences />
};

export default section;
