import { Category } from "../Category";
import { ModelMetadata, Result, validateDate } from "../metadata";
import { Registry, RegistryType } from "./Registry";

export interface WithInvoiceTime {
  month: number;
  year: number;
}

export class CreditCardRegistry extends Registry implements WithInvoiceTime {
  constructor(
    id: string,
    public cardId: string,
    public month: number, public year: number, date: Date,
    description: string,
    value: number,
    tags: string[] = [],
    categoryId?: string,
    observation?: string,
    importInfo?: any
  ) { 
    super(id, RegistryType.CREDIT, true, value, description, date, tags, categoryId, observation, importInfo);
  }

  static metadata: ModelMetadata<CreditCardRegistry> = {
    aiToolCreator: {
      name: "create_creditcard_entry",
      description: "Registra um lançamento vinculado a um cartão de crédito. sempre valide se o usuário comprou mesmo no crédito ou para débito a ferramenta adequada.",
      properties: {
        cardId: {
          type: "string",
          description: "Identificador do cartão responsável pelo lançamento.",
        },
        value: {
          type: "number",
          description: "Valor positivo do lançamento; use negativo somente para reembolsos ou estornos.",
        },
        description: {
          type: "string",
          description: "Descrição do lançamento na fatura.",
        },
        date: {
          type: "string",
          description: "Data da compra ou lançamento no formato YYYY-MM-DDTHH:mm.",
        },
        invoiceMonth: {
          type: "number",
          description: "Mês de referência da fatura (1-12). Se omitido, será derivado da data.",
        },
        invoiceYear: {
          type: "number",
          description: "Ano de referência da fatura. Se omitido, será derivado da data.",
        },
        categoryId: {
          type: "string",
          description: Category.idAiExtractor,
        },
        observation: {
          type: "string",
          description: "Observações adicionais sobre o lançamento.",
        },
      },
      required: ["cardId", "value", "description", "date"],
    },
    from: (params): Result<CreditCardRegistry> => {
      const {
        cardId,
        value,
        description,
        date,
        invoiceMonth,
        invoiceYear,
        categoryId,
        observation,
      } = params as Record<string, unknown>;

      if (typeof description !== "string" || description.trim().length === 0) {
        return { success: false, error: "Description is required." };
      }

      const numericValue = Number(value);
      if (!Number.isFinite(numericValue) || numericValue === 0) {
        return { success: false, error: "Value must be a non-zero number." };
      }

      const parsedDate = validateDate(String(date));
      if (!parsedDate.success) {
        return { success: false, error: parsedDate.error };
      }

      if (!cardId) {
        return { success: false, error: "Card identifier is required." };
      }

      const baseDate = parsedDate.result;

      let month = Number(invoiceMonth);
      let year = Number(invoiceYear);

      if (!Number.isInteger(month) || month < 1 || month > 12) {
        month = baseDate.getMonth() + 1;
      }

      if (!Number.isInteger(year) || year < 1900) {
        year = baseDate.getFullYear();
      }

      const registry = new CreditCardRegistry(
        "",
        String(cardId),
        month,
        year,
        baseDate,
        description.trim(),
        numericValue,
        [],
        categoryId ? String(categoryId) : undefined,
        observation ? String(observation) : undefined
      );

      return { success: true, result: registry };
    },
  };
}
