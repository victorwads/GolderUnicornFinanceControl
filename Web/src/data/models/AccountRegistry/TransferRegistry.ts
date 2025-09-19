import { Registry, RegistryType } from "../Registry";

export class TransferRegistry extends Registry {
  constructor(
    id: string,
    public transferId: string, // uuid v7
    public sourceAccountId: string,
    public targetAccountId: string,
    date: Date,
    description: string,
    value: number,
    tags: string[] = [],
    observation?: string,
    importInfo?: any
  ) { 
    super(id, RegistryType.TRANSFER, true, value, description, date, tags, undefined, observation, importInfo);
  }
}