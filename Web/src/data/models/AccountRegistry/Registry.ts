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
  registry: Registry;
  category?: Category;
}

export abstract class Registry extends DocumentModel {

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

  static metadataBase: ModelMetadata<Registry> = {
    aiToolCreator: {
      name: "",
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
          description: "Data do lançamento",
        },
        categoryId: {
          type: "string",
          description: "Identificador da categoria associada ao lançamento. você pode testar varios termos no search_domain[categories] para decidir a categoria para o usuário. se não encontrar nada que faça sentido, deixe em branco.",
        },
        observation: { type: "string", description: "Observações adicionais sobre a recorrência." },
      },
      required: [],
    },
    from: (params, repositories): Result<Registry> => 
      ({ success: false, error: "Not implemented in base class" }),
  };
}
