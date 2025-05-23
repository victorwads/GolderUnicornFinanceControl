import Translation from './base';
import ptBR from './ptBR';
import en from './en';

export const Langs = {
  ptBR: "Português (Brasil)",
  en: "English",
};

export function setLanguage(language: typeof CurrentLang = '') {
  window.CurrentLang = language;
  switch (language) {
    case 'ptBR':
      window.Lang = ptBR;
      break;
    case 'en':
      window.Lang = en;
      break;
    default:
      window.Lang = en;
  }
  Lang = window.Lang;
  CurrentLang = language;
  localStorage.setItem('lang', language);
}

setLanguage(localStorage.getItem('lang') as keyof typeof Langs || '');

declare global {
  var Lang: Translation;
  var CurrentLang: keyof typeof Langs | '';
}
