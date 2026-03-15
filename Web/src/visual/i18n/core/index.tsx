import { Fragment } from "react";

import type {
  AsyncTranslation,
  AvailableLangs,
  DeepReadonly,
  LoadedLangInfo,
  Translation,
  TranslationRender,
  TranslationResult,
  TranslationTokenRender,
  TranslationTokensRender,
} from "./types";

function defaultTokenRender<T>(text: string): TranslationResult<T> {
  return <>{text}</>;
}

export function withRender<
  Tokens extends string,
  TokenTranslations extends Record<Tokens, string>,
>(
  templateString: string,
  tokensTranslations: TokenTranslations &
    Record<Exclude<keyof TokenTranslations, Tokens>, never>,
  tokensRenders?: TranslationTokensRender<Tokens>,
): TranslationRender<Tokens> {
  const tokens = templateString.split(/(%[^%]+%)/g).filter(Boolean);
  const emptyRenders = {} as TranslationTokensRender<Tokens>;

  return (customTokens, customRenders) => {
    const renders: TranslationTokensRender<Tokens> = {
      ...(tokensRenders || emptyRenders),
      ...(customRenders || emptyRenders),
    };

    return tokens.map((segment, index) => {
      let value = segment;
      let render = renders.default || defaultTokenRender;

      const match = segment.match(/^%([^%]+)%$/);
      if (match) {
        const tokenName = match[1] as Tokens;
        render =
          (renders[tokenName] as TranslationTokenRender<Tokens> | undefined) || render;
        value =
          customTokens?.[tokenName] ||
          tokensTranslations[tokenName] ||
          `Translation Error: Unknown translation for token '${tokenName}' for template '${templateString}'`;
        return <Fragment key={`t-${tokenName}`}>{render(value, tokenName)}</Fragment>;
      }

      return <Fragment key={`t-${index}`}>{render(value)}</Fragment>;
    });
  };
}

export async function loadLanguage<A extends string, T extends Translation>(
  availableLangs: AvailableLangs<A, T>,
  defaultLang: A,
  language?: A | string,
): Promise<LoadedLangInfo<T>> {
  if (!language || !availableLangs[language as A]) {
    const browserLang = navigator.language.replace("-", "").toLowerCase();
    const langKeys = Object.keys(availableLangs).map((key) => key.toLowerCase());
    language =
      langKeys.find((key) => key === browserLang) ||
      langKeys.find((key) => browserLang.startsWith(key)) ||
      defaultLang;
  }

  const info = availableLangs[language as A];
  let lang: T;

  if (typeof info.lang === "function") {
    lang = await (info.lang as AsyncTranslation<T>)().then(({ default: translation }) => translation);
  } else {
    lang = info.lang;
  }

  return {
    ...info,
    lang: deepFreeze(lang),
  };
}

export function deepFreeze<T>(obj: T): DeepReadonly<T> {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((property) => {
    const value = obj[property as keyof T];
    if (
      value &&
      (typeof value === "object" || typeof value === "function") &&
      !Object.isFrozen(value)
    ) {
      deepFreeze(value);
    }
  });

  return obj as DeepReadonly<T>;
}
