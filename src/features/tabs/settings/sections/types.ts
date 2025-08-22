import { ReactNode } from 'react';

export interface SettingsSection {
  id: string;
  title: string;
  content: ReactNode;
}

export interface Progress {
  filename: string;
  current: number;
  max: number;
  sub?: { max: number; current: number };
  type: 'export' | 'resave';
}
