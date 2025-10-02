import { ReactNode } from 'react';

export interface SettingsSection {
  id: string;
  title: string;
  content: ReactNode;
}

export type { Progress } from '../../../../data/crypt/progress';
