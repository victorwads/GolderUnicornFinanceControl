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
    public type: AccountType,
    public archived: boolean = false,
    public color?: string,
    public includeInTotal: boolean = false
  ) {
    super(id);
  }

  static metadata: ModelMetadata<Account> = {
    aiToolCreator: {
      name: "account",
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
      },
      required: ["name", "bankId", "type"],
    },
    from: (data, repositories) => {
      const { id, bankId, name, initialBalance, type } = data;

      const bank = repositories.banks.getLocalById(String(bankId));
      if (!bank) return { success: false, error: `Banco com ID ${bankId} não encontrado.` };

      if (id) {
        const existing = repositories.accounts.getLocalById(String(id));
        if (existing) {
          return { 
            success: true,
            result: {
              id,
              name: String(name || existing.name),
              initialBalance: Number(initialBalance || existing.initialBalance) || 0,
              bankId: String(bankId || existing.bankId),
              type: String(type || existing.type) as AccountType,
            }
          };
        }
      }

      return {
        success: true,
        result: new Account(
          "",
          String(name),
          Number(initialBalance) || 0,
          String(bankId),
          String(type) as AccountType
        ),
      };
    },
  };
}
