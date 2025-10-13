import ModelContext from "../metadata/ModelContext";
import { ModelMetadata } from "../metadata";
import { AccountsRegistry } from "./AccountRegistry";
import { Transaction, RegistryType } from "./Transaction";

interface TransferInfo {
  transferId: string;
  sourceAccountId: string;
  targetAccountId: string;
}

export class TransferTransaction extends AccountsRegistry {
  static categoryId = "transfer";

  constructor(
    id: string,
    public transfer: TransferInfo,
    accountId: string,
    date: Date,
    description: string,
    value: number,
    tags: string[] = [],
    observation?: string
  ) {
    super(
      id,
      RegistryType.TRANSFER,
      accountId,
      value,
      description,
      date,
      true,
      tags,
      TransferTransaction.categoryId,
      observation
    );
  }

  public toTuple(): [TransferTransaction, TransferTransaction] {
    const source = new TransferTransaction(
      "",
      { ...this.transfer },
      this.transfer.sourceAccountId,
      this.date,
      this.description,
      this.value * -1,
      this.tags,
      this.observation
    );
    const target = new TransferTransaction(
      "",
      { ...this.transfer },
      this.transfer.targetAccountId,
      this.date,
      this.description,
      this.value,
      this.tags,
      this.observation
    );
    return [source, target];
  }

  static isTransferTransaction(transaction: AccountsRegistry): boolean {
    return 'transfer' in transaction && transaction.categoryId === TransferTransaction.categoryId;
  }

  static metadata2: ModelMetadata<
    Partial<TransferTransaction & TransferInfo>
  > = {
    aiToolCreator: {
      description: "Create a bank transfer between accounts.",
      properties: {
        ...Transaction.metadataBase.aiToolCreator.properties,
        sourceAccountId: {
          type: "string",
          description:
            "Identifier of the source account from which the amount is debited",
        },
        targetAccountId: {
          type: "string",
          description:
            "Identifier of the target account to which the amount is credited",
        },
      },
      required: ["sourceAccountId", "targetAccountId", "value", "description"],
    },
    from: (params, repositories, update) => {
      if(update) {
        // TODO: fix updating transfer info with Assistant will not work cause `transfer` reassign logic is not implemented
        return { success: false, error: "Updating transfer transactions using assistant is not supported yet" };
      }

      const { assignId, assignString, assignNumber, assignDate, toResult, data } = new ModelContext(
        TransferTransaction,
        update
      );

      if (params.sourceAccountId === params.targetAccountId) {
        return {
          success: false,
          error: "Source and target accounts must be different",
        };
      }

      assignDate("date", params.date);
      assignNumber("value", params.value);
      assignString("description", params.description);
      assignString("observation", params.observation);
      assignId(null, repositories.accounts, params.sourceAccountId);
      assignId(null, repositories.accounts, params.targetAccountId);

      const result = toResult(() => ({
        transfer: {
          transferId: crypto.randomUUID(),
          sourceAccountId: String(params.sourceAccountId),
          targetAccountId: String(params.targetAccountId),
        },
      }))

      if(result.success) {
        return {
          success: true,
          result: (result.result as TransferTransaction).toTuple(),
        }
      }
      return result;
    },
  };
}
