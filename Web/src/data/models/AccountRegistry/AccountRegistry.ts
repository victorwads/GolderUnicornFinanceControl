import { ModelMetadata, Result, validateDate } from "../metadata";
import { Registry, RegistryType } from "../Registry";

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

  static metadata: ModelMetadata<AccountsRegistry> = {
    aiToolCreator: {
      name: "create_checking_account_entry",
      description: "Registra uma movimentação em conta corrente ou equivalente.",
      properties: {
        accountId: {
          type: "string",
          description: "Identificador da conta onde o lançamento será aplicado.",
        },
        value: {
          type: "number",
          description: "Valor numérico do lançamento; use negativo para despesas e positivo para receitas.",
        },
        description: {
          type: "string",
          description: "Breve descrição do lançamento.",
        },
        date: {
          type: "string",
          description: "Data do lançamento",
        },
        paid: {
          type: "boolean",
          description: "Indica se o lançamento já está pago/compensado ou é previsão. O padrão é falso (previsão).",
        },
        categoryId: {
          type: "string",
          description: "Identificador da categoria associada ao lançamento, se houver. você pode procurar por categorias existentes para obter IDs válidos.",
        },
        observation: {
          type: "string",
          description: "Observações opicionais sobre o lançamento que não cabem na descrição.",
        },
      },
      required: ["accountId", "value", "description", "date"],
    },
    from: (params): Result<AccountsRegistry> => {
      const {
        accountId,
        value,
        description,
        date,
        paid,
        categoryId,
        observation,
      } = params as Record<string, unknown>;

      const parsedDate = validateDate(date as string);
      if (!parsedDate.success) return parsedDate;

      return { success: true, result: new AccountsRegistry(
        "",
        RegistryType.ACCOUNT,
        String(accountId),
        Number(value),
        String(description),
        parsedDate.result,
        Boolean(paid),
        [],
        categoryId ? String(categoryId) : undefined,
        observation ? String(observation) : undefined
      ) };
    },
  };
}
