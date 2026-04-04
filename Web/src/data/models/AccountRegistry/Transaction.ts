import { Category } from "../Category";
import { DocumentModel } from "../DocumentModel";
import { ModelMetadata, Result } from "../metadata";

export enum RegistryType {
  ACCOUNT,
  ACCOUNT_RECURRENT,
  CREDIT,
  CREDIT_RECURRENT,
  TRANSFER,
  INVOICE,
}

export interface RegistryWithDetails {
  sourceName: string;
  registry: Transaction;
  category?: Category;
}

export abstract class Transaction extends DocumentModel {

  constructor(
    public id: string,
    public type: RegistryType,
    public paid: boolean = false,
    public value: number,
    public description: string,
    public date: Date,
    public tags: string[] = [],
    public categoryId?: string,
    public observation?: string,
    public relatedInfo?: string
  ) {
    super(id);
  }

  public get formatedPrice() {
    return this.value.toLocaleString(CurrentLangInfo.short, {
      style: "currency",
      currency: "BRL",
    });
  };

  static ai = {
    observation: "Additional notes or observations about the transfer besides the description and accounts involved or other structured parameters",
  }

  static metadataBase: ModelMetadata<Transaction> = {
    aiToolCreator: {
      description: "",
      properties: {
        value: {
          type: "number",
          description:
            "Valor numérico do lançamento; use negativo para despesas e positivo para receitas.",
        },
        description: {
          type: "string",
          description: "Breve descrição do que foi comprado ou recebido.",
        },
        date: {
          type: "string",
          description: "Date of the transaction in YYYY-MM-DDTHH:mm format. Consider the current conversation date and the user's wording to infer whether it refers to this month or the next matching date.",
        },
        categoryId: {
          type: "string",
          description: "Identificador da categoria associada ao lançamento. você pode testar varios termos no search_domain[categories] para decidir a categoria para o usuário. se não encontrar nada que faça sentido, deixe em branco.",
        },
        observation: { type: "string", description: "Observações adicionais sobre a recorrência." },
      },
      required: [],
    },
    from: (params, repositories): Result<Transaction> => 
      ({ success: false, errors: ["Not implemented in base class"] }),
  };
}
