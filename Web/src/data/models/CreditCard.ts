import { a } from "vitest/dist/chunks/suite.d.FvehnV49";
import { DocumentModel } from "./DocumentModel";
import { ModelMetadata } from "./metadata";
import ModelContext from "./metadata/ModelContext";

const CREDIT_CARD_BRANDS = [
  "Visa",
  "Mastercard",
  "American Express",
  "Elo",
  "Hipercard",
  "Diners Club",
];

export class CreditCard extends DocumentModel {
  constructor(
    public id: string,
    public name: string = '',
    public limit: number = 0,
    public brand: string = '',
    public accountId: string = '',
    public closingDay: number = 1,
    public dueDay: number = 1,
    public archived: boolean = false,
    public importInfo?: any
  ) { 
    super(id);
  }

  static metadata: ModelMetadata<CreditCard> = {
    aiToolCreator: {
      description: "Cria ou atualiza um cartão de crédito.",
      properties: {
        name: { type: "string", description: "Nome do cartão de crédito." },
        limit: { type: "number", description: "Limite do cartão de crédito." },
        brand: { type: "string", description: "Bandeira do cartão de crédito." + CREDIT_CARD_BRANDS.join(", ") },
        accountId: { type: "string", description: "ID da conta associada ao cartão de crédito." },
        closingDay: { type: "number", description: "Dia do fechamento da fatura do cartão de crédito." },
        dueDay: { type: "number", description: "Dia do vencimento da fatura do cartão de crédito." },
      },
      required: ["name", "limit", "brand", "closingDay", "dueDay"],
    },
    from: (params, repositories, update) => {
      const { assignId, assignString, assignNumber, assignEnum, ensureUnique, toResult, data } = new ModelContext(
        repositories.creditCards.modelClass,
        update
      );

      ensureUnique(["name"], repositories.creditCards, [params.name]);
      assignId("accountId", repositories.accounts, params.accountId);
      assignString("name", params.name);
      assignNumber("limit", params.limit, 0);
      assignNumber("closingDay", params.closingDay, 1, 31);
      assignNumber("dueDay", params.dueDay, 1, 31);
      assignEnum("brand", CREDIT_CARD_BRANDS, params.brand);
      
      return toResult();
    }
    ,
  }
}