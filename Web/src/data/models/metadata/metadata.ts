export type Result<T> =
  | { success: true; result: T }
  | { success: false; error?: string };

type BaseProperty = {
  type: string;
  description?: string;
  required: boolean;
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

export interface ModelMetadata<M, R extends string = Extract<keyof M, string>, D = unknown> {
  aiToolCreator: {
    name: string;
    description: string;
    properties: Record<R, Properties>;
    required: R[];
  };
  from: (data: D) => Result<M>;
}