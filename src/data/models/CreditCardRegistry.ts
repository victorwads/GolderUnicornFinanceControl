import { Registry, RegistryType } from "./Registry";

export interface WithInvoiceTime {
  month: number;
  year: number;
}

export class CreditCardRegistry extends Registry implements WithInvoiceTime {
  constructor(
    id: string,
    public cardId: string,
    public month: number, public year: number, date: Date,
    description: string,
    value: number,
    tags: string[] = [],
    categoryId?: string,
    observation?: string,
    importInfo?: any
  ) { 
    super(id, RegistryType.CREDIT, true, value, description, date, tags, categoryId, observation, importInfo);
  }
}