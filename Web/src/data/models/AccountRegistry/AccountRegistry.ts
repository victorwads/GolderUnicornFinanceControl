import { Transaction, RegistryType } from "./Transaction";
import { ModelMetadata, Result } from "../metadata";
import ModelContext from "../metadata/ModelContext";

export class AccountsRegistry extends Transaction {
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
    super(
      id,
      RegistryType.ACCOUNT,
      paid,
      value,
      description,
      date,
      tags,
      categoryId,
      observation,
      relatedInfo
    );
  }

  static metadata: ModelMetadata<AccountsRegistry> = {
    aiToolCreator: {
      description:
        "Registra uma movimentação em conta corrente ou equivalente. sempre valide se o usuário comprou mesmo no debito ou se comrou no crédito e use a ferramenta adequada.",
      properties: {
        ...Transaction.metadataBase.aiToolCreator.properties,
        accountId: {
          type: "string",
          description:
            "Identificador da conta onde o lançamento será aplicado.",
        },
        paid: {
          type: "boolean",
          description:
            "Indica se o lançamento já está pago/compensado ou é previsão. O padrão é falso (previsão).",
        },
      },
      required: ["accountId", "value", "description", "date"],
    },
    from: (params, repositories, update) => {
      const { assignId, assignString, assignNumber, assignDate, assignBoolean, toResult } = new ModelContext(
        repositories.accountTransactions.modelClass,
        update
      );
      assignId("accountId", repositories.accounts, params.accountId);
      assignId("categoryId", repositories.categories, params.categoryId);
      assignDate("date", params.date)
      assignNumber("value", params.value);
      assignString("description", params.description);
      assignString("observation", params.observation);
      assignBoolean("paid", params.paid);

      return toResult(() => ({
        'type': RegistryType.ACCOUNT,
      }));
    },
  };
}
