import Translation from './base';
import ptBR from './ptBR';
import en from './en';
import es from './es';
import fr from './fr';
import zh from './zh';

export type Lang = keyof typeof Langs | undefined;
export const Langs = {
  "ptBR": {lang: ptBR, name: "Português (Brasil)"},
  "en": {lang: en, name: "English"},
  "es": {lang: es, name: "Español"},
  "fr": {lang: fr, name: "Français"},
  "zh": {lang: zh, name: "中文"},
};

export function setLanguage(language?: Lang) {
  if(language)
    localStorage.setItem('lang', language);
  else
    localStorage.removeItem('lang');
  window.SavedLang = language;

  if (!language) {
    const browserLang = navigator.language.replace('-', '').toLowerCase();
    language = Object.keys(Langs).find(
      key => 
        key.toLowerCase() === browserLang ||
        browserLang.startsWith(key.toLowerCase())
    ) as Lang || 'en';
  }
  window.CurrentLang = language;
  window.Lang = Langs[language]?.lang || en;
}

setLanguage(localStorage.getItem('lang') as Lang);

declare global {
  var Lang: Translation;
  var CurrentLang: keyof typeof Langs;
  var SavedLang: Lang | undefined;
}
