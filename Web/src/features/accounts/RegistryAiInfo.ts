import { AIConfig, AIItemTransformer } from '@features/speech/AIParserManager';

export interface RegistryAiItem {
  description?: string;
  value?: number | string;
  date?: string;
  paid?: boolean;
  accountName?: string;
  categoryName?: string;
  notes?: string;
  tags?: string[];
}

export const RegistryAiConfig: AIConfig = {
  listDescription: 'financial registry form fields',
  outputAditionalFieldsDescription: `
description?: string
value?: number
date?: string (ISO or relative like "today")
paid?: boolean
accountName?: string
categoryName?: string
notes?: string
tags?: string[]
`,
  outputExample: `User: "Gastei 25 reais no mercado hoje; marca como pago."
Assistant:
[{ "action": "update", "description": "mercado", "value": -25, "date": "2025-08-15", "paid": true, "categoryName": "mercado" }]
`,
  availableActions: ['update'],
};

const normalizeNumber = (value: number | string | undefined): number | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'number') return value;
  const sanitized = value
    .replace(/[^0-9-,.]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const num = parseFloat(sanitized);
  return isNaN(num) ? undefined : num;
};

const daysMap: Record<string, number> = {
  hoje: 0,
  today: 0,
  hoy: 0,
  amanha: 1,
  amanhã: 1,
  tomorrow: 1,
  mañana: 1,
  ontem: -1,
  yesterday: -1,
  ayer: -1,
};

const weekdayMap: Record<string, number> = {
  domingo: 0, sunday: 0,
  segunda: 1, 'segunda-feira': 1, monday: 1, lunes: 1,
  terça: 2, 'terca': 2, 'terça-feira': 2, tuesday: 2, martes: 2,
  quarta: 3, 'quarta-feira': 3, wednesday: 3, miercoles: 3, miércoles: 3,
  quinta: 4, 'quinta-feira': 4, thursday: 4, jueves: 4,
  sexta: 5, 'sexta-feira': 5, friday: 5, viernes: 5,
  sábado: 6, sabado: 6, saturday: 6,
};

const normalizeDate = (dateStr?: string): string | undefined => {
  if (!dateStr) return undefined;
  const lower = dateStr.toLowerCase();
  if (daysMap[lower] !== undefined) {
    const d = new Date();
    d.setDate(d.getDate() + daysMap[lower]);
    return d.toISOString().split('T')[0];
  }
  const matched = Object.keys(weekdayMap).find(w => lower.includes(w));
  if (matched) {
    const target = weekdayMap[matched];
    const today = new Date();
    const diff = (target + 7 - today.getDay()) % 7 || 7;
    const d = new Date();
    d.setDate(today.getDate() + diff);
    return d.toISOString().split('T')[0];
  }
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split('T')[0];
  return undefined;
};

export const RegistryAiNormalizer: AIItemTransformer<RegistryAiItem> = (item) => {
  const normalized: RegistryAiItem = { ...item };
  if (item.value !== undefined) normalized.value = normalizeNumber(item.value);
  if (item.date) normalized.date = normalizeDate(item.date);
  return normalized;
};
