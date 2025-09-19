import {
  ModelMetadata,
  Result,
  validateDate,
} from "../metadata";
import { RegistryType } from "./Registry";
import { AccountsRegistry } from "./AccountRegistry";

interface TransferInfo {
  transferId: string,
  sourceAccountId: string,
  targetAccountId: string,
}

export class TransferRegistry extends AccountsRegistry {
  constructor(
    id: string,
    public transfer: TransferInfo,
    accountId: string,
    date: Date,
    description: string,
    value: number,
    tags: string[] = [],
    observation?: string,
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
      undefined,
      observation,
    );
  }

  public toTuple(): { source: TransferRegistry, target: TransferRegistry} {
    const source = new TransferRegistry(
      "",
      { ...this.transfer },
      this.transfer.sourceAccountId,
      this.date,
      this.description,
      this.value * -1,
      this.tags,
      this.observation,
    );
    const target = new TransferRegistry(
      "",
      { ...this.transfer },
      this.transfer.targetAccountId,
      this.date,
      this.description,
      this.value,
      this.tags,
      this.observation,
    );
    return { source, target };
  }

  static metadataTransfer: ModelMetadata<Partial<TransferRegistry & TransferInfo>> = {
    aiToolCreator: {
      name: "create_transfer_between_accounts",
      description: "Cria uma transferência entre contas.",
      properties: {
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
        value: {
          type: "number",
          description: "Positive amount to be transferred",
        },
        date: {
          type: "string",
          description: "Date of the transfer",
        },
        description: {
          type: "string",
          description: "Brief description about what/whys is the transfer besides the accounts involved",
        },
        observation: {
          type: "string",
          description: "Additional notes or observations about the transfer besides the description and accounts involved",
        },
      },
      required: ["sourceAccountId", "targetAccountId", "value", "description"],
    },
    from: (params) => {
      const {
        sourceAccountId,
        targetAccountId,
        value,
        date,
        description,
        observation,
      } = params;

      if (sourceAccountId === targetAccountId) {
        return {
          success: false,
          error: "Source and target accounts must be different",
        };
      }

      const validDate = validateDate(String(date));
      if (!validDate.success) return validDate;

      return {
        success: true,
        result: new TransferRegistry(
          "",
          {
            transferId: crypto.randomUUID(),
            sourceAccountId: String(sourceAccountId),
            targetAccountId: String(targetAccountId),
          },
          "",
          validDate.result,
          String(description),
          Number(value),
          [],
          observation ? String(observation) : undefined
        ).toTuple(),
      };
    },
  };
}
