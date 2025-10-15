import { useState } from 'react';

import { Langs, setLanguage } from '@lang';

interface AIMicrophoneOnboardingLanguageStepProps {
  titleId: string;
  onBack: () => void;
  onNext: () => void;
}

export default function AIMicrophoneOnboardingLanguageStep({
  titleId,
  onBack,
  onNext,
}: AIMicrophoneOnboardingLanguageStepProps) {
  const [selection, setSelection] = useState<string>(SavedLang || '');

  const options = [
    { value: '', label: `${Lang.commons.default} (${navigator.language})` },
    ...Object.entries(Langs).map(([value, info]) => ({ value, label: info.name })),
  ];

  const previewInfo = selection
    ? Langs[selection as keyof typeof Langs] ?? Langs['en']
    : Langs[CurrentLang] ?? Langs['en'];

  const previewCode = selection
    ? previewInfo.short
    : CurrentLangInfo.short;

  const handleConfirm = () => {
    const langKey = selection || undefined;
    setLanguage(langKey as keyof typeof Langs | undefined);
    setSelection(SavedLang || '');
    onNext();
  };

  return (
    <>
      <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.lang.title}</h2>
      <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.lang.p1}</p>
      <div className="ai-mic-onboarding__language-summary">
        <span className="ai-mic-onboarding__language-name">{previewInfo.name}</span>
        <span className="ai-mic-onboarding__language-code">{previewCode}</span>
      </div>
      <div className="ai-mic-onboarding__select-wrapper">
        <select
          className="ai-mic-onboarding__select"
          value={selection}
          onChange={(event) => setSelection(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="ai-mic-onboarding__actions ai-mic-onboarding__actions--split">
        <button
          type="button"
          className="ai-mic-onboarding__button ai-mic-onboarding__button--secondary"
          onClick={onBack}
        >
          {Lang.aiMic.onboarding.actions.back}
        </button>
        <button
          type="button"
          className="ai-mic-onboarding__button ai-mic-onboarding__button--primary"
          onClick={handleConfirm}
        >
          {Lang.aiMic.onboarding.actions.confirm}
        </button>
      </div>
    </>
  );
}
