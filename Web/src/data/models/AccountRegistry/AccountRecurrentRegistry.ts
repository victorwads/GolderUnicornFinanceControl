import { Category } from "../Category";
import { ModelMetadata, Result, validateDate } from "../metadata";

import { AccountsRegistry } from "./AccountRegistry";
import { Registry, RegistryType } from "./Registry";
import { ResourceUseChannel } from '../../repositories/ResourcesUseRepositoryShared';

export type RecurrentType = "monthly";

export type AccountRecurrentMetadata = {
  recurrentId: string;
  recurrentType: RecurrentType;
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

export class AccountRecurrentRegistry extends Registry {
  constructor(
    id: string,
    public recurrentMetadata: AccountRecurrentMetadata,
    value: number,
    description: string,
    date: Date,
    paid: boolean = false,
    tags: string[] = [],
    categoryId?: string,
    observation?: string
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
    AccountRecurrentRegistry & { accountId?: string; cardId?: string; recurrencyDay: number }
  > = {
    aiToolCreator: {
      name: "checking_account_recurrent_entry",
      description: "Register recurrent expenses in checking account or credit card. Used for entries that repeat monthly, such as subscriptions, fixed bills, etc.",
      properties: {
        ...Registry.metadataBase.aiToolCreator.properties,
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
            description: "Dia do mês em que ocorre a recorrência (1-31).",
        },
      },
      required: [ "value", "description", "date", "categoryId", "recurrencyDay" ],
    },
    from: (
      params: Record<string, unknown>,
      repositories: any
    ): Result<AccountRecurrentRegistry> => {
      const {
        accountId,
        cardId,
        value: price,
        description,
        date,
        categoryId,
        observation,
        recurrencyDay,
      } = params;

      const parsedDate = validateDate(date as string);
      if (!parsedDate.success) return parsedDate;

      let value;
      let day = Number(recurrencyDay);
      if (!recurrencyDay) {
        day = parsedDate.result.getDate();
        return { success: false, error: "recurrencyDay deve ser um número entre 1 e 31." };
      }

      let metadata: AccountRecurrentMetadata;
      if (!accountId && cardId) {
        const card = repositories.creditCards.getLocalById(String(cardId));
        if (!card) return { success: false, error: `Cartão de crédito com id ${cardId} não encontrado.` };
        metadata = {
          isCreditCard: true,
          cardId: String(cardId),
          recurrentId: crypto.randomUUID(),
          recurrentType: "monthly",
          recurrentDay: Number(recurrencyDay),
        };
        value = Number(price) * -1;
      } else if (accountId && !cardId) {
        const account = repositories.accounts.getLocalById(String(accountId));
        if (!account) return { success: false, error: `Conta com id ${accountId} não encontrada.` };
        metadata = {
          isCreditCard: false,
          accountId: String(accountId),
          recurrentId: crypto.randomUUID(),
          recurrentType: "monthly",
          recurrentDay: Number(recurrencyDay),
        };
        value = Number(price)
      } else {
        return { success: false, error: "Você deve fornecer exatamente ou accountId ou cardId." };
      }

      if (categoryId) {
        const category = repositories.categories.getLocalById(String(categoryId));
        if (!category)
          return { success: false, error: `Categoria com id ${categoryId} não encontrada.`};
      }

      return {
        success: true,
        result: new AccountRecurrentRegistry(
          "",
          metadata,
          Number(value),
          String(description),
          parsedDate.result,
          false,
          [],
          categoryId ? String(categoryId) : undefined,
          observation ? String(observation) : undefined,
        ),
      };
    },
  };
}
