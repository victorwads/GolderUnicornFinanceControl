import { Repositories } from "@repositories";
import { DocumentData } from "firebase/firestore";
import { RawData } from "./ModelContext";

export type Result<T> =
  | { success: true; result: T }
  | { success: false; errors?: string[] | string };

type BaseProperty = {
  type: string;
  description?: string;
};

type StringProperty = BaseProperty & {
  type: "string";
  pattern?: string;
};

type NumberProperty = BaseProperty & {
  type: "number";
  minimum?: number;
  maximum?: number;
};

type BooleanProperty = BaseProperty & {
  type: "boolean";
};

type ObjectProperty = BaseProperty & {
  type: "object";
  properties: Record<string, Properties>;
};

export type Properties =
  | StringProperty
  | NumberProperty
  | BooleanProperty
  | ObjectProperty;

export interface ModelMetadata<M, R extends string = Extract<keyof M, string>, D = Record<R, unknown>> {
  aiToolCreator: {
    description: string;
    properties: Partial<{ [K in R]?: Properties }>;
    required: R[];
  };
  from: (data: D, repositories: Repositories, update?: boolean, oldData?: M) => Result<DocumentData>;
}

export function validateRequiredFields<T extends RawData<any>>(data: T, requiredFields: (keyof T)[]): Result<T> {
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (!(field in data)) {
      missing.push(String(field));
    }
  }
  if (missing.length > 0) {
    return { success: false, errors: missing.map(f => `Missing: ${f}`) };
  }
  return { success: true, result: data };
}
