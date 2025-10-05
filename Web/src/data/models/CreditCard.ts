import { DocumentModel } from "./DocumentModel";
import { ModelMetadata } from "./metadata";

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
      name: "credit_card",
      properties: {
        name: { type: "string", description: "Nome do cartão de crédito." },
        limit: { type: "number", description: "Limite do cartão de crédito." },
        brand: { type: "string", description: "Bandeira do cartão de crédito." + CREDIT_CARD_BRANDS.join(", ") },
        accountId: { type: "string", description: "ID da conta associada ao cartão de crédito." },
        closingDay: { type: "number", description: "Dia do fechamento da fatura do cartão de crédito." },
        dueDay: { type: "number", description: "Dia do vencimento da fatura do cartão de crédito." },
      },
      required: ["name", "limit", "brand", "accountId", "closingDay", "dueDay"],
    },
    from: (data, repositories) => {
      if (data.id )
        return { success: false, error: "CreditCard update not implemented yet" }

      if (!CREDIT_CARD_BRANDS.includes(String(data.brand))) {
        return { success: false, error: `Bandeira do cartão de crédito ${data.brand} não é válida.` };
      }

      const accountId = repositories.accounts.getLocalById(String(data.accountId));
      if (!accountId) {
        return { success: false, error: `Conta com ID ${data.accountId} não encontrada.` };
      }
      
      return {
        success: true,
        result: new CreditCard(
          '',
          String(data.name),
          Number(data.limit),
          String(data.brand),
          String(data.accountId),
          Number(data.closingDay),
          Number(data.dueDay),
        )
      };
    }
    ,
  }
}