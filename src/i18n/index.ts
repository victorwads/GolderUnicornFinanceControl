import Translation from './base';
import ptBR from './ptBR';
import en from './en';
import es from './es';
import fr from './fr';
import zh from './zh';

export const Langs = {
  ptBR: "Português (Brasil)",
  en: "English",
  es: "Español",
  fr: "Français",
  zh: "中文",
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
    case 'es':
      window.Lang = es;
      break;
    case 'fr':
      window.Lang = fr;
      break;
    case 'zh':
      window.Lang = zh;
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
