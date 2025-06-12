import { Category } from "./Category";
import { DocumentModel } from "./DocumentModel";

export enum RegistryType {
  ACCOUNT,
  ACCOUNT_RECURRENT,
  CREDIT,
  CREDIT_RECURRENT,
  TRANSFER,
  INVOICE,
}

export interface RegistryWithDetails {
  sourceName: string;
  registry: Registry;
  category?: Category;
}

export abstract class Registry extends DocumentModel {

  constructor(
    public id: string,
    public type: RegistryType,
    public paid: boolean = false,
    public value: number,
    public description: string,
    public date: Date,
    public tags: string[] = [],
    public categoryId?: string,
    public observation?: string,
    public relatedInfo?: string
  ) {
    super(id);
  }

  public get formatedPrice() {
    return this.value.toLocaleString(navigator.language, {
      style: "currency",
      currency: "BRL",
    });
  };
}
