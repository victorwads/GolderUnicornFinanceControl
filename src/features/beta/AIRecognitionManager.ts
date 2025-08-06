

export type AIResponseItem = {
  action: 'add' | 'update' | 'remove';
  id: string; // identifying the same product between action calls
  name?: string; // should be the formated product name
  price?: number; // price paid for each unit
  quantity?: number; // optional
  expirationDate?: string; // ISO Date
};

export type AIResonse = AIResponseItem[]
