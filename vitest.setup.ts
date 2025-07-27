import '@testing-library/jest-dom';
import en from './src/i18n/en';

declare global {
  var Lang: typeof en;
}

globalThis.Lang = en;
