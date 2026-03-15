/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Locale } from "date-fns";
import type { ReactNode } from "react";

export type TranslationResult<T> = ReactNode;

export type TranslationTokens<T extends string> = Record<T, string>;
export type TranslationTokenRender<T> = (text: string, token?: T) => TranslationResult<T>;
export type TranslationTokensRender<T extends string> = {
  default?: TranslationTokenRender<T>;
} & Record<T, TranslationTokenRender<T>>;

export type TranslationRender<Tokens extends string = string> = (
  customTokens?: TranslationTokens<Tokens>,
  customRenders?: TranslationTokensRender<Tokens>,
) => TranslationResult<Tokens>;

export type TranslationItems = string[];
export type TranslationWithParams = (...args: any[]) => string;

export interface Translation {
  [key: string]:
    | string
    | Translation
    | Translation[]
    | TranslationItems
    | TranslationWithParams
    | TranslationRender<any>;
}

export type ModuleReturn<T extends Translation> = { default: T };
export type AsyncTranslation<T extends Translation> = () => Promise<ModuleReturn<T>>;
export type LangInfo<T extends Translation, LT = T | AsyncTranslation<T>> = {
  lang: LT;
  locale: Locale;
  name: string;
  short: string;
};

export type AvailableLangs<A extends string, T extends Translation> = Record<A, LangInfo<T>>;

export type DeepReadonly<T> = T extends TranslationWithParams | TranslationRender
  ? T
  : { readonly [K in keyof T]: DeepReadonly<T[K]> };

export type LoadedLangInfo<T extends Translation> = LangInfo<T, DeepReadonly<T>>;
