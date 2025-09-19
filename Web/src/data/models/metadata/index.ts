export type Result<T> =
  | { success: true; result: T }
  | { success: false; error?: string };

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
    name: string;
    description: string;
    properties: { [K in R]?: Properties };
    required: R[];
  };
  from: (data: D) => Result<unknown>;
}

export function validateDate(input: string): Result<Date> {
  const regex = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  const match = regex.exec(input)
  if (!match) return { success: false, error: "Invalid date format use YYYY-MM-DDTHH:mm" }

  return { success: true, result: new Date(input) }
}

export function validateOptionalDate(input: string): Result<Date|undefined> {
  if(!input || String(input).trim().length === 0) return { success: true, result: undefined }

  return validateDate(input)
}

export function validateRequiredFields<T extends Record<string, unknown>>(data: T, requiredFields: (keyof T)[]): Result<T> {
  const missing: string[] = [];
  for (const field of requiredFields) {
    if (!(field in data)) {
      missing.push(String(field));
    }
  }
  if (missing.length > 0) {
    return { success: false, error: `Missing required fields: ${missing.join(", ")}` };
  }
  return { success: true, result: data };
}
