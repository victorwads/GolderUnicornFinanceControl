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
      description: "Cria uma conta bancária.",
      properties: {
        name: {
          type: "string",
          description: "Nome da conta.",
        },
        initialBalance: {
          type: "number",
          description: "Saldo inicial da conta.",
        },
        bankId: {
          type: "string",
          description: "ID do banco associado à conta.",
        },
        type: {
          type: "string",
          description:
            "Tipo da conta. Pode ser 'CURRENT' (corrente), 'SAVINGS' (poupança), 'INVESTMENT' (investimento) ou 'CASH' (dinheiro).",
        },
      },
      required: ["name", "bankId", "type"],
    },
    from: (data: Record<string, unknown>) => {
      return {
        success: true,
        result: new Account(
          "",
          String(data.name),
          Number(data.initialBalance) || 0,
          String(data.bankId),
          String(data.type) as AccountType
        ),
      };
    },
  };
}
