import ModelContext from "./metadata/ModelContext";
import { DocumentModel } from "./DocumentModel";
import { ModelMetadata } from "./metadata";

export enum AccountType {
  CURRENT = "CURRENT",
  SAVINGS = "SAVINGS",
  INVESTMENT = "INVESTMENT",
  CASH = "CASH",
}

export class Account extends DocumentModel {
  constructor(
    public id: string,
    public name: string,
    public initialBalance: number,
    public bankId: string,
    public type: AccountType = AccountType.CURRENT,
    public archived: boolean = false,
    public color?: string,
    public includeInTotal: boolean = false
  ) {
    super(id);
  }

  static metadata: ModelMetadata<Account> = {
    aiToolCreator: {
      description: "create an account, by default create checking account",
      properties: {
        name: {
          type: "string",
          description: "name of the account, can be the bank name or a user nickname",
        },
        initialBalance: {
          type: "number",
          description: "initial balance of the account. if not provided, defaults to 0",
        },
        bankId: {
          type: "string",
          description: "ID of the bank associated with the account.",
        },
        type: {
          type: "string",
          description:
            "Type of account. Can be 'CURRENT' (checking), 'SAVINGS' (savings), 'INVESTMENT' (investment), or 'CASH' (cash).",
        },
        color: {
          type: "string",
          description: "Color associated with the account for easy identification in the UI.",
        },
      },
      required: ["name", "bankId", "type"],
    },
    from: (params, repositories, update) => {
      const { assignId, assignString, assignNumber, assignEnum, assignBoolean, assignColor, toResult } = new ModelContext(
        repositories.accounts.modelClass,
        update
      );

      assignId("bankId", repositories.banks, params.bankId);
      assignString("name", params.name);
      assignNumber("initialBalance", params.initialBalance, 0);
      assignString("bankId", params.bankId);
      assignColor("color", params.color);
      assignEnum("type", Object.values(AccountType), params.type);
      assignBoolean("includeInTotal", params.includeInTotal);

      return toResult();
    },
  };
}
