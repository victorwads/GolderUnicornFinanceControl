import { memo } from 'react';

import { LanguageSectionProps } from './AIMicrophoneOnboarding.types';

const AIMicrophoneOnboardingLanguageStep = memo(({ titleId, language, onBackToInfo, onConfirmLanguage }: {
  titleId: string;
  language: LanguageSectionProps;
  onBackToInfo: () => void;
  onConfirmLanguage: () => void;
}) => (
  <>
    <h2 id={titleId} className="ai-mic-onboarding__title">{Lang.aiMic.onboarding.lang.title}</h2>
    <p className="ai-mic-onboarding__text">{Lang.aiMic.onboarding.lang.p1}</p>
    <div className="ai-mic-onboarding__language-summary">
      <span className="ai-mic-onboarding__language-name">{language.displayName}</span>
      <span className="ai-mic-onboarding__language-code">{language.code}</span>
    </div>
    <div className="ai-mic-onboarding__select-wrapper">
      <select
        className="ai-mic-onboarding__select"
        value={language.selection}
        onChange={(event) => language.onChange(event.target.value)}
      >
        {language.options.map((option) => (
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
        onClick={onBackToInfo}
      >
        {Lang.aiMic.onboarding.actions.back}
      </button>
      <button
        type="button"
        className="ai-mic-onboarding__button ai-mic-onboarding__button--primary"
        onClick={onConfirmLanguage}
      >
        {Lang.aiMic.onboarding.actions.confirm}
      </button>
    </div>
  </>
));

AIMicrophoneOnboardingLanguageStep.displayName = 'AIMicrophoneOnboardingLanguageStep';

export default AIMicrophoneOnboardingLanguageStep;
