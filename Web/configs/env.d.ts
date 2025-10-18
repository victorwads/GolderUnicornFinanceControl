/// <reference types="vite/client" />

// Mapeia aliases para o TS (apenas para ajudar IDE; o mapeamento real está em tsconfig paths)
declare module '@models/*';
declare module '@repositories/*';
declare module '@utils/*';
declare module '@componentsDeprecated/*';
declare module '@features/*';
declare module '@lang/*';
declare module '@resourceUse';

declare module "@layouts/*";
declare module "@components/*";
declare module "@lib/*";
declare module "@hooks/*";
declare module "@contexts/*";


// Globals de teste definidos em vitest.setup.ts
import type en from '../src/i18n/en';
declare global {
  var Lang: typeof en;
}
