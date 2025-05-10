import DocumentModel from "./DocumentModel";

export enum RegistryType {
  ACCOUNT,
  ACCOUNT_RECURRENT,
  CREDIT,
  CREDIT_RECURRENT,
  TRANSFER,
  INVOICE,
}

export default class AccountsRegistry extends DocumentModel {

  constructor(
    public id: string,
    public type: RegistryType,
    public accountId: string,
    public value: number,
    public description: string,
    public date: Date,
    public paid: boolean = false,
    public tags: string[] = [],
    public categoryId?: string,
    public observation?: string,
    public relatedInfo?: string
  ) {
    super(id);
  }
}