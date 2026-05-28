import ModelContext from "./metadata/ModelContext";
import { ModelMetadata } from "./metadata";
import { RegistryType, Transaction } from "./AccountRegistry/Transaction";

export type WishlistPriority = "low" | "medium" | "high";

export class WishlistItem extends Transaction {
  constructor(
    id: string = "",
    value: number = 0,
    description: string = "",
    date: Date = new Date(),
    public priority: WishlistPriority = "medium",
    categoryId?: string,
    observation?: string,
    tags: string[] = [],
  ) {
    super(
      id,
      RegistryType.WISHLIST,
      false,
      value,
      description,
      date,
      tags,
      categoryId,
      observation
    );
  }

  static metadata: ModelMetadata<WishlistItem> = {
    aiToolCreator: {
      description: "Registra um desejo de compra sem movimentar saldo, conta ou cartão.",
      properties: {
        ...Transaction.metadataBase.aiToolCreator.properties,
        priority: {
          type: "string",
          description: "Prioridade do desejo. Valores validos: low, medium, high.",
        },
      },
      required: ["value", "description", "date", "priority"],
    },
    from: (params, repositories, update) => {
      const { assignId, assignString, assignNumber, assignDate, assignEnum, toResult } = new ModelContext(
        repositories.wishlistItems.modelClass,
        update
      );

      assignId("categoryId", repositories.categories, params.categoryId);
      assignDate("date", params.date);
      assignNumber("value", params.value, 0);
      assignString("description", params.description);
      assignString("observation", params.observation);
      assignEnum("priority", ["low", "medium", "high"], params.priority);

      return toResult(() => ({
        type: RegistryType.WISHLIST,
        paid: false,
        priority: params.priority || "medium",
      }));
    },
  };
}
