/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_OPENAI_PROJECT?: string;
  readonly VITE_OPENAI_ORG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
