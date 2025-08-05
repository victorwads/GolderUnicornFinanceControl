import Translation from './base';
import ptBR from './ptBR';
import en from './en';
import es from './es';
import fr from './fr';
import zh from './zh';
import hi from './hi';

export type Lang = keyof typeof Langs | undefined;
export type LangInfo = {
  lang: Translation;
  name: string;
  short: string;
};

export const Langs: Record<string, LangInfo> = {
  "pt": {lang: ptBR, name: "Português - Portuguese", short: "pt-BR"},
  "en": {lang: en, name: "English - English", short: "en-US"},
  "es": {lang: es, name: "Español - Spanish", short: "es-ES"},
  "fr": {lang: fr, name: "Français - French", short: "fr-FR"},
  "zh": {lang: zh, name: "中文 - Chinese", short: "zh-CN"},
  "hi": {lang: hi, name: "हिन्दी - Hindi", short: "hi-IN"},
};

export const getCurrentLangInfo = (): LangInfo => {
  return Langs[window.CurrentLang] || Langs['en'];
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
  window.Lang = getCurrentLangInfo().lang;
}

setLanguage(localStorage.getItem('lang') as Lang);

declare global {
  var Lang: Translation;
  var CurrentLang: keyof typeof Langs;
  var SavedLang: Lang | undefined;
}
