import Registry, { RegistryType } from "./Registry";

export default class CreditCardRegistry extends Registry {
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