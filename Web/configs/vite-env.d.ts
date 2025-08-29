/// <reference path="./env.d.ts" />
/// <reference types="vitest" />

interface ImportMetaEnv {
  readonly VITE_MOD_K: string;
  readonly VITE_MOD_P: string;
  readonly VITE_MOD_O: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
