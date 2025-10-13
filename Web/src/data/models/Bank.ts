import { Account } from "./Account";
import { DocumentModel } from "./DocumentModel";
import { ModelMetadata } from "./metadata";

export interface WithInfoAccount extends Account {
  bank: Bank
}

export class Bank extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public fullName: string = name,
    public logoUrl?: string
  ) {
    super(id);
  }

  static metadata: ModelMetadata<Bank> = {
    aiToolCreator: {
      description: "",
      properties: {},
      required: [],
    },
    from: () => ({
      success: false,
      error: "Bank manipulation not allowed",
    }),
  };
}

export const selectBank = new Bank("", "Selecione um banco");
