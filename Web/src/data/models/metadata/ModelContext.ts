import { BaseRepository } from "@repositories";
import { DocumentModel } from "../DocumentModel";
import { Result } from ".";

export type RawData<M> = Partial<{
  [field in keyof M]: unknown;
}>;

export default class ModelContext<Model extends DocumentModel> {
  constructor(
    public readonly modelClass: new (...args: any[]) => Model,
    public readonly update: boolean = false,
    public readonly errors: string[] = [],
    public data: RawData<Model> = {}
  ) {}

  assignNumber = (fieldName: (keyof Model) | null, value: unknown, min?: number, max?: number): number | undefined => {
    if (!value && value !== 0) return;
    const numberValue = Number(value);
    if (isNaN(numberValue)) {
      this.errors.push(`Invalid number for field ${fieldName as string}`);
    } else {
      if (min !== undefined && numberValue < min) {
        this.errors.push(`Number for field ${fieldName as string} must be at least ${min}`);
        return;
      }
      if (max !== undefined && numberValue > max) {
        this.errors.push(`Number for field ${fieldName as string} must be at most ${max}`);
        return;
      }
      if (fieldName) this.data[fieldName] = numberValue;
    }
    return numberValue;
  };

  assignString = (fieldName: keyof Model, value: unknown) => {
    if (!value || String(value).trim().length === 0) return;
    this.data[fieldName] = String(value).trim();
  };

  assignColor = (fieldName: keyof Model, value: unknown) => {
    if (value && !/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(String(value))) {
        this.errors.push(`Invalid color for field ${fieldName as string}`);
    } else {
      this.data[fieldName] = String(value);
    }
  }

  assignEnum = (fieldName: keyof Model, values: string[], value: unknown) => {
    if (!value) return;
    value = String(value);
    if (values.includes(value as string)) {
      this.data[fieldName] = value;
    } else {
      this.errors.push(`Invalid enum value for field ${fieldName as string}. Valid values are: ${values.join(", ")}`);
    }
  };

  assignBoolean = (fieldName: keyof Model, value: unknown) => {
    if (value === null || value === undefined) return;
    if (typeof value === "boolean") {
      this.data[fieldName] = value;
      return;
    } else if (typeof value === "string") {
      const lower = value.toLowerCase();
      if (lower === "true") {
        this.data[fieldName] = true;
        return;
      } else if (lower === "false") {
        this.data[fieldName] = false;
        return;
      }
    }
    this.errors.push(`Invalid boolean for field ${fieldName as string}`);
  };

  assignDate = (fieldName: keyof Model, input: unknown) => {
    if (!input || String(input).trim().length === 0) return;

    return this.validateDateFormat(fieldName, String(input));
  };

  assignId = <AssignModel extends DocumentModel>(
    fieldName: (keyof Model) | null,
    repo: BaseRepository<AssignModel>,
    id: unknown
  ): AssignModel | undefined => {
    if (!id) return;
    id = String(id);
    const item = repo.getLocalById(id as string);
    if (item) {
      if (fieldName) { this.data[fieldName] = id; }
      return item;
    } else {
      this.errors.push(`Invalid ${repo.entityName} id`);
    }
  };

  toResult = (
    createBaseModel?: () => RawData<Model>
  ): Result<RawData<Model> | Model> => {
    if (this.errors.length > 0) {
      return { success: false, errors: this.errors };
    }
    if (!this.update) {
      this.data = { ...createBaseModel?.(), ...this.data };
    }

    return {
      success: true,
      result: this.update
        ? this.data
        : (Object.assign(new this.modelClass(), this.data) as Model),
    };
  };

  private validateDateFormat(fieldName: keyof Model, input: string) {
    const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(:\d{2}){0,1}$/;
    const match = regex.exec(input);
    if (!match) {
      this.errors.push("Invalid date format use YYYY-MM-DDTHH:mm:ss");
    } else {
      const append = input.length < 17 ? ":00.000Z" : ".000Z";
      this.data[fieldName] = new Date(input + append);
    }
  }
}
