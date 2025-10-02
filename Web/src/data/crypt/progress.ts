export interface Progress {
  filename: string;
  current: number;
  max: number;
  sub?: { max: number; current: number };
  type: 'export' | 'resave';
}
