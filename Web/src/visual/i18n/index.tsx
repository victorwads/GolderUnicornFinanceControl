import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { enUS, es, fr, hi, ptBR, zhCN } from "date-fns/locale";

import type FinanceTranslation from "./base";
import type { AvailableLangs, DeepReadonly, LoadedLangInfo } from "./core/types";
import { deepFreeze, loadLanguage } from "./core";

import ptBRLang from "./translations/ptBR";
import enLang from "./translations/en";
import esLang from "./translations/es";
import frLang from "./translations/fr";
import zhLang from "./translations/zh";
import hiLang from "./translations/hi";

export type FinanceLang = "pt" | "en" | "es" | "fr" | "zh" | "hi";
type TranslationContextValue = {
  setLanguage: (language: FinanceLang | undefined, save?: boolean) => void;
  available: AvailableLangs<FinanceLang, FinanceTranslation>;
  current: LoadedLangInfo<FinanceTranslation>;
  saved?: FinanceLang;
};

const LANG_STORE_KEY = "lang";
const DEFAULT_LANG: FinanceLang = "pt";
const LANG_CHANGE_EVENT = "finance-lang-change";

export const Langs: AvailableLangs<FinanceLang, FinanceTranslation> = {
  pt: { lang: ptBRLang, name: "Português - Portuguese", short: "pt-BR", locale: ptBR },
  en: { lang: enLang, name: "English - English", short: "en-US", locale: enUS },
  es: { lang: esLang, name: "Español - Spanish", short: "es-ES", locale: es },
  fr: { lang: frLang, name: "Français - French", short: "fr-FR", locale: fr },
  zh: { lang: zhLang, name: "中文 - Chinese", short: "zh-CN", locale: zhCN },
  hi: { lang: hiLang, name: "हिन्दी - Hindi", short: "hi-IN", locale: hi },
};

const LangContext = createContext<TranslationContextValue>({} as TranslationContextValue);

export const useTranslation = () => useContext(LangContext);

function resolveSavedLanguage(): FinanceLang | undefined {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const saved = window.localStorage.getItem(LANG_STORE_KEY) as FinanceLang | null;
  return saved || undefined;
}

function applyLanguage(info: LoadedLangInfo<FinanceTranslation>, saved?: FinanceLang) {
  window.CurrentLang = (Object.keys(Langs).find(
    (key) => Langs[key as FinanceLang].short === info.short,
  ) || DEFAULT_LANG) as FinanceLang;
  window.Langs = Langs;
  window.CurrentLangInfo = info;
  window.SavedLang = saved;
  window.Lang = info.lang;
}

const initialLangInfo = (() => {
  const saved = resolveSavedLanguage();
  const selected = saved && Langs[saved] ? saved : DEFAULT_LANG;
  const info = Langs[selected];
  const loaded = {
    ...info,
    lang: deepFreeze(info.lang as FinanceTranslation),
  } as LoadedLangInfo<FinanceTranslation>;
  if (typeof window !== "undefined") {
    applyLanguage(loaded, saved);
  }
  return loaded;
})();

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<FinanceLang | undefined>(() => resolveSavedLanguage());
  const [current, setCurrent] = useState<LoadedLangInfo<FinanceTranslation>>(initialLangInfo);

  const setLanguage = useCallback(
    (language: FinanceLang | undefined, save = true) => {
      if (typeof window !== "undefined" && save) {
        if (language) {
          window.localStorage.setItem(LANG_STORE_KEY, language);
          setSaved(language);
        } else {
          window.localStorage.removeItem(LANG_STORE_KEY);
          setSaved(undefined);
        }
      }

      loadLanguage(Langs, DEFAULT_LANG, language).then((info) => {
        applyLanguage(info, language);
        setCurrent(info);
      });
    },
    [],
  );

  useEffect(() => {
    setLanguage(saved, false);
  }, [saved, setLanguage]);

  useEffect(() => {
    const syncLanguage = () => {
      setSaved(resolveSavedLanguage());
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === LANG_STORE_KEY) {
        syncLanguage();
      }
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(LANG_CHANGE_EVENT, syncLanguage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LANG_CHANGE_EVENT, syncLanguage);
    };
  }, []);

  return (
    <LangContext.Provider
      value={{
        setLanguage,
        available: Langs,
        current,
        saved,
      }}
    >
      {children}
    </LangContext.Provider>
  );
}

export function notifyLanguageChanged() {
  window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
}

declare global {
  // eslint-disable-next-line no-var
  var Lang: DeepReadonly<FinanceTranslation>;
  // eslint-disable-next-line no-var
  var Langs: AvailableLangs<FinanceLang, FinanceTranslation>;
  // eslint-disable-next-line no-var
  var CurrentLang: FinanceLang;
  // eslint-disable-next-line no-var
  var CurrentLangInfo: LoadedLangInfo<FinanceTranslation>;
  // eslint-disable-next-line no-var
  var SavedLang: FinanceLang | undefined;

  interface Window {
    Lang: DeepReadonly<FinanceTranslation>;
    Langs: AvailableLangs<FinanceLang, FinanceTranslation>;
    CurrentLang: FinanceLang;
    CurrentLangInfo: LoadedLangInfo<FinanceTranslation>;
    SavedLang: FinanceLang | undefined;
  }
}
