import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { enUS, es, fr, hi, ptBR, zhCN } from "date-fns/locale";

import { ProjectStorage } from "@utils/ProjectStorage";

import type Translation from "./base";
import type { AvailableLangs, DeepReadonly, LoadedLangInfo } from "../visual/i18n/core/types";
import { deepFreeze, loadLanguage } from "../visual/i18n/core";

import ptBRLang from "./ptBR";
import enLang from "./en";
import esLang from "./es";
import frLang from "./fr";
import zhLang from "./zh";
import hiLang from "./hi";

export type Lang = "pt" | "en" | "es" | "fr" | "zh" | "hi";
type TranslationContextValue = {
  setLanguage: (language: Lang | undefined, save?: boolean) => void;
  available: AvailableLangs<Lang, Translation>;
  current: LoadedLangInfo<Translation>;
  saved?: Lang;
};

const DEFAULT_LANG: Lang = "pt";
const LANG_CHANGE_EVENT = "finance-lang-change";
const LangContext = createContext<TranslationContextValue>({} as TranslationContextValue);

export const Langs: AvailableLangs<Lang, Translation> = {
  pt: { lang: ptBRLang, name: "Português - Portuguese", short: "pt-BR", locale: ptBR },
  en: { lang: enLang, name: "English - English", short: "en-US", locale: enUS },
  es: { lang: esLang, name: "Español - Spanish", short: "es-ES", locale: es },
  fr: { lang: frLang, name: "Français - French", short: "fr-FR", locale: fr },
  zh: { lang: zhLang, name: "中文 - Chinese", short: "zh-CN", locale: zhCN },
  hi: { lang: hiLang, name: "हिन्दी - Hindi", short: "hi-IN", locale: hi },
};

export const useTranslation = () => useContext(LangContext);

function getSavedLanguage(): Lang | undefined {
  return (ProjectStorage.get("lang") as Lang | null) || undefined;
}

function resolveLangKey(info: LoadedLangInfo<Translation>): Lang {
  return (
    (Object.keys(Langs).find((key) => Langs[key as Lang].short === info.short) as Lang | undefined) ||
    DEFAULT_LANG
  );
}

function applyLanguage(info: LoadedLangInfo<Translation>, saved?: Lang) {
  const language = resolveLangKey(info);
  window.Langs = Langs;
  window.CurrentLang = language;
  window.CurrentLangInfo = info;
  window.SavedLang = saved;
  window.Lang = info.lang;
  window.ThemeSettings?.setLang(language);
}

const initialLangInfo = (() => {
  const saved = getSavedLanguage();
  const selected = saved && Langs[saved] ? saved : DEFAULT_LANG;
  const info = Langs[selected];
  const loaded = {
    ...info,
    lang: deepFreeze(info.lang as Translation),
  } as LoadedLangInfo<Translation>;
  if (typeof window !== "undefined") {
    applyLanguage(loaded, saved);
  }
  return loaded;
})();

export function setLanguage(language?: Lang) {
  if (language) {
    ProjectStorage.set("lang", language);
  } else {
    ProjectStorage.remove("lang");
  }
  window.SavedLang = language;
  window.dispatchEvent(new Event(LANG_CHANGE_EVENT));

  loadLanguage(Langs, DEFAULT_LANG, language).then((info) => {
    applyLanguage(info, language);
  });
}

export default function TranslationProvider({ children }: { children: React.ReactNode }) {
  const [saved, setSaved] = useState<Lang | undefined>(() => getSavedLanguage());
  const [current, setCurrent] = useState<LoadedLangInfo<Translation>>(initialLangInfo);

  const updateLanguage = useCallback(
    (language: Lang | undefined, save = true) => {
      if (save) {
        if (language) {
          ProjectStorage.set("lang", language);
          setSaved(language);
        } else {
          ProjectStorage.remove("lang");
          setSaved(undefined);
        }
        window.dispatchEvent(new Event(LANG_CHANGE_EVENT));
      }

      loadLanguage(Langs, DEFAULT_LANG, language).then((info) => {
        applyLanguage(info, language);
        setCurrent(info);
      });
    },
    [],
  );

  useEffect(() => {
    updateLanguage(saved, false);
  }, [saved, updateLanguage]);

  useEffect(() => {
    const syncLanguage = () => {
      setSaved(getSavedLanguage());
    };

    const onStorage = (event: StorageEvent) => {
      const scopedKey = `${ProjectStorage.PREFIX}lang`;
      if (event.key === null || event.key === scopedKey) {
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
        setLanguage: updateLanguage,
        available: Langs,
        current,
        saved,
      }}
    >
      {children}
    </LangContext.Provider>
  );
}

declare global {
  // eslint-disable-next-line no-var
  var Lang: DeepReadonly<Translation>;
  // eslint-disable-next-line no-var
  var Langs: AvailableLangs<Lang, Translation>;
  // eslint-disable-next-line no-var
  var CurrentLang: Lang;
  // eslint-disable-next-line no-var
  var CurrentLangInfo: LoadedLangInfo<Translation>;
  // eslint-disable-next-line no-var
  var SavedLang: Lang | undefined;
}
