import ModelContext from "../metadata/ModelContext";
import { ModelMetadata } from "../metadata";
import { Transaction, RegistryType } from "./Transaction";
import { CreditCard } from "../CreditCard";

export interface WithInvoiceTime {
  month: number;
  year: number;
}

export class CreditCardRegistry extends Transaction implements WithInvoiceTime {
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

  static calcInvoiceDate(card: CreditCard, date: Date): { month: number; year: number } {
    const currentMonth = date.getMonth() + 1;
    const currentYear = date.getFullYear();
    const currentInvoice = card.closingDay > date.getDate();
    const month = currentInvoice ? (currentMonth + 1) : (currentMonth + 2);
    const year = currentInvoice ? currentYear : (month > 12 ? currentYear + 1 : currentYear);
    return { month, year };
  }

  static metadata: ModelMetadata<CreditCardRegistry & { invoiceMonth: any, invoiceYear: any }> = {
    aiToolCreator: {
      description: "Registra um lançamento vinculado a um cartão de crédito. sempre valide se o usuário comprou mesmo no crédito ou para débito a ferramenta adequada.",
      properties: {
        ...Transaction.metadataBase.aiToolCreator.properties,
        cardId: {
          type: "string",
          description: "Identificador do cartão responsável pelo lançamento.",
        },
        invoiceMonth: {
          type: "number",
          description: "Mês de referência da fatura (1-12). Se omitido, será derivado da data.",
        },
        invoiceYear: {
          type: "number",
          description: "Ano de referência da fatura. Se omitido, será derivado da data.",
        },
      },
      required: ["cardId", "value", "description", "date"],
    },
    from: (params, repositories, update) => {
      const { assignId, assignString, assignNumber, assignDate, toResult, data } = new ModelContext(
        repositories.creditCardsTransactions.modelClass,
        update
      );
      const creditCard = assignId("cardId", repositories.creditCards, params.cardId);
      assignId("categoryId", repositories.categories, params.categoryId);
      assignDate("date", params.date)
      assignNumber("value", params.value);
      assignNumber("month", params.invoiceMonth, 1, 12);
      assignNumber("year", params.invoiceYear, 1900);
      assignString("description", params.description);
      assignString("observation", params.observation);
      
      if (!update && creditCard) {
        const date = data.date as Date;
        if (!data.month || !data.year) {
          const { month, year } = CreditCardRegistry.calcInvoiceDate(creditCard, date);
          if (!data.month) data.month = month;
          if (!data.year) data.year = year;
        }
      }

      return toResult();
    },
  };
}
