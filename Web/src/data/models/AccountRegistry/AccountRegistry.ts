import {Registry, RegistryType } from "../Registry";

export class AccountsRegistry extends Registry {

  constructor(
    id: string,
    public type: RegistryType = RegistryType.ACCOUNT,
    public accountId: string,
    value: number,
    description: string,
    date: Date,
    paid: boolean = false,
    tags: string[] = [],
    categoryId?: string,
    observation?: string,
    relatedInfo?: string
  ) {
    super(id, RegistryType.ACCOUNT, paid, value, description, date, tags, categoryId, observation, relatedInfo);
  }
}
