import ModelContext from "../metadata/ModelContext";
import { Transaction, RegistryType } from "./Transaction";
import { ModelMetadata } from "../metadata";

export type RecurrentTransactionType = "monthly";

export type RecurrentTransactionMetadata = {
  recurrentId: string;
  recurrentType: RecurrentTransactionType;
  recurrentDay: number;
} & (
  | {
      isCreditCard: true;
      cardId: string;
    }
  | {
      isCreditCard: false;
      accountId: string;
    }
);

export class RecurrentTransaction extends Transaction {
  constructor(
    id: string,
    public recurrentMetadata: RecurrentTransactionMetadata,
    value: number,
    description: string,
    date: Date,
    categoryId?: string,
    observation?: string,
    tags: string[] = [],
  ) {
    super(
      id,
      RegistryType.ACCOUNT_RECURRENT,
      false,
      value,
      description,
      date,
      tags,
      categoryId,
      observation
    );
  }

  static metadata2: ModelMetadata<
    RecurrentTransaction & { accountId?: string; cardId?: string; recurrencyDay: number }
  > = {
    aiToolCreator: {
      description: "Register recurrent expenses in checking account or credit card. Used for entries that repeat monthly, such as subscriptions, fixed bills, etc.",
      properties: {
        ...Transaction.metadataBase.aiToolCreator.properties,
        accountId: {
          type: "string",
          description: "ID of the current account if the recurrent entry will be debit",
        },
        cardId: {
          type: "string",
          description: "ID of the credit card if the recurrent entry will be credit",
        },
        recurrencyDay: {
            type: "number",
            description: "Day of the month when the recurrence occurs (1-31).",
        },
      },
      required: [ "value", "description", "date", "categoryId", "recurrencyDay" ],
    },
    from: (params, repositories, update) => {
      if (update) {
        // TODO: fix update logic with metadata update
        return { success: false, errors: "Updating Recurrent Transactions using assistant is not supported yet." };
      }

      const { assignId, assignString, assignNumber, assignDate, toResult, data } = new ModelContext(
        RecurrentTransaction,
        update
      );

      assignId("categoryId", repositories.categories, params.categoryId);
      assignDate("date", params.date);
      assignString("description", params.description);
      assignString("observation", params.observation);

      const value = assignNumber("value", params.value);
      const account = assignId(null, repositories.accounts, params.accountId);
      const card = assignId(null, repositories.creditCards, params.cardId);
      const day = assignNumber(null, params.recurrencyDay, 1, 31);

      let metadata: RecurrentTransactionMetadata;
      if(day && value) {
        if (card && !account) {
          metadata = {
            isCreditCard: true,
            cardId: card.id,
            recurrentId: crypto.randomUUID(),
            recurrentType: "monthly",
            recurrentDay: day,
          };
          data.value = value * -1;
        } else if (account && !card) {
          metadata = {
            isCreditCard: false,
            accountId: account.id,
            recurrentId: crypto.randomUUID(),
            recurrentType: "monthly",
            recurrentDay: day,
          };
        } else {
          return { success: false, errors: "Only accountId or cardId must be provided." };
        }
      }

      return toResult(() => ({
        recurrentMetadata: metadata,
      }))
    },
  };
}
