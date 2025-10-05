import { DocumentModel } from "./DocumentModel";
import { ModelMetadata } from "./metadata";

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
      properties: {},
      required: [],
    },
    from: (data: any) => 
      ({ success: false, error: "CreditCard manipulation not implemented" }
    ),
  }
}