import Registry, { RegistryType } from "./Registry";

export interface WithInvoiceTime {
  month: number;
  year: number;
}

export default class CreditCardRegistry extends Registry implements WithInvoiceTime {
  constructor(
    id: string,
    public cardId: string,
    public month: number, public year: number,
    value: number,
    description: string,
    date: Date,
    tags: string[] = [],
    categoryId?: string,
    observation?: string,
    importInfo?: any
  ) { 
    super(id, RegistryType.CREDIT, false, value, description, date, tags, categoryId, observation, importInfo);
  }
}