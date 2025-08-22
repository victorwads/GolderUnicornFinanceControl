import { OpenAI } from "openai";
import { ChatCompletionMessageParam } from "openai/resources/index";

import StreamedJsonArrayParser from "./StreamedJsonArrayParser";
import { addResourceUse, AiModel } from "@resourceUse";

const CHAT_HISTORY_SIZE = 2;
const n = (id: string | undefined | null): string =>
  id?.toString().trim().toLowerCase() || "";

export type WithChanged<T> = T & { changed?: boolean };
export type AIActionHandler<
  T extends AIItemData,
  A extends AIDefaultActions = AIDefaultActions
> = (action: AIItemWithAction<T, A>, changes?: Partial<WithChanged<T>>[]) => void

export default class AIActionsParser<
  T extends AIItemData,
  A extends AIDefaultActions = AIDefaultActions
> {
  private openai: OpenAI;
  private chatHistory: ChatCompletionMessageParam[] = [];

  public items: WithChanged<T>[] = [];
  public onAction: AIActionHandler<T, A> = () => {};

  /**
   * @param normalizer Function to normalize item fields (e.g., convert strings to dates)
   */
  constructor(
    private config: AIConfig,
    private normalizer: AIItemTransformer<T> = (item) => item,
    private itemContextMap: AIItemTransformer<T> = ({ id, name }) =>
      ({ id, name } as Partial<T>)
  ) {
    this.items = [];
    this.openai = this.initOpenAI();
  }

  public async parse(
    text: string,
    userLanguage: string
  ): Promise<AIParseResponse> {
    const today = new Date().toISOString().split("T")[0];
    const prompt = `
You are a personal assistant that helps users manage a list of items.
Your role is to convert the user's real-time speech input into actions, each represented by a JSON object.

List description:
${this.config.listDescription.split("\n").join(", ")}

Rules for each action object:
- Choose an action from {
${Object.entries(this.config.availableActions || DEFAULT_AI_ACTIONS).map(
  ([action, description]) => `  - ${action} - ${description}`
).join("\n")}
}
- Create an object with
  - action: (choose action)
  - id: (identifier of item this actions applies to, add action should generate a uuid-v4)
- Put some optional fields only if it is a new information about the item that would change the "current list reference" {
${this.config.additionalFields?.map((field) => 
  `  - ${field.name}: ${field.type || ''} (${field.description})`).join("\n")
}
}
- Never use null unless it means removing a field.
- Dates must be in ISO 8601. For relative dates, use "today".
- Output NDJSON: one object per line (no extra text).

`.trim();

    const context = `
Context:
- today: ${today}
- my language: ${userLanguage}
- current list reference: ${JSON.stringify(
      this.items.map(this.itemContextMap)
    ).replace(/\n/g, " ")}
`.trim();

    this.items.forEach((item) => {
      delete item.changed;
    });

    const actions: AIItemWithAction<T, A>[] = [];
    const jsonParser = new StreamedJsonArrayParser<AIItemWithAction<T, A>>(
      (item) => {
        actions.push(item);
        const { id, action } = item;
        if (action === "stop") {
          this.onAction(item);
          return;
        }
        if (!id) throw new Error("Item must have an id");

        const normalized = { ...item, ...this.normalizer(item) } as Partial<T>;
        delete (normalized as any).action;

        let index = this.items.findIndex((i) => n(i.id) === n(id));
        let changes: Partial<WithChanged<T>>[] = [];
        switch (action) {
          case "remove":
            changes = this.remove(normalized, index);
            break;
          case "add":
            changes = this.add(normalized, index);
            break;
          case "update":
            changes = this.update(normalized, index);
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }
        this.saveCurrentList();
        this.onAction(item, changes);
      }
    );

    const fullResponse = await this.withOpenAI(
      prompt,
      context,
      text,
      (chunk) => {
        for (const ch of chunk) jsonParser.push(ch);
      }
    );

    console.log("AIParserManager final response:", actions, fullResponse);

    return {
      actions: actions.length,
      usedTokens: fullResponse.usedTokens,
    };
  }

  private add(item: Partial<T>, index: number): Partial<T>[] {
    if (!item.name) {
      console.error(new Error("Item to add must have a name"), item);
      return [];
    }
    if (index !== -1) {
      console.warn(
        `Item with id '${item.id}' already exists, switching add to update`,
        item
      );
      return this.update(item, index);
    }
    const created = { ...item, changed: true } as WithChanged<T>;
    this.items.push(created);
    return [created];
  }

  private update(item: Partial<T>, index: number): Partial<T>[] {
    if (index === -1) {
      // Try partial id match (both directions)
      index = this.items.findIndex(
        ({ id }) => n(item?.id).includes(n(id)) || n(id).includes(n(item.id))
      );
      console.warn(
        `Item with id ${item.id} not found exactly for update, trying to find by partial match`,
        item
      );
    }
    if (index === -1) {
      console.warn(
        `Item with id ${item.id} not found for update, switching to add`,
        item
      );
      return this.add(item, index);
    } else {
      const current = this.items[index];
      this.items[index] = { ...current, ...item, changed: true };
      return [this.items[index]];
    }
  }

  private remove(item: Partial<T>, index: number): Partial<T>[] {
    if (index === -1) {
      console.warn(`Item with id ${item.id} not found for removal`, item);
      return [];
    }
    const { items } = this;

    this.items = items.filter(({ id }) => n(id) !== n(item.id));
    this.saveCurrentList();
    return items.filter(({ id }) => n(id) === n(item.id));;
  }

  /** @deprecated not called */
  private saveCurrentList() {}

  private async withOpenAI(
    system: string,
    context: string,
    user: string,
    onStream?: (chunk: string) => void
  ): Promise<AIResponse> {
    const userMessage: ChatCompletionMessageParam = {
      role: "user",
      content: user,
    };
    const messages: Array<ChatCompletionMessageParam> = [
      { role: "system", content: system },
      ...this.chatHistory.slice(-CHAT_HISTORY_SIZE),
      { role: "user", content: context },
      userMessage,
    ];

    console.log("AIParserManager withOpenAI messages:", messages);
    const model: AiModel = "gpt-5-nano";

    addResourceUse({ ai: { [model]: { requests: 1 } } });
    const stream = await this.openai.chat.completions.create({
      model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
      reasoning_effort: 'minimal',
      // temperature: 0.1,
      // tool_choice: 'none',
      // tools: [],
      // top_p: 0.3,
    });

    let full = "";
    let tokens = {
      input: 0,
      output: 0,
    };
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content ?? "";
      if (delta) {
        full += delta;
        onStream?.(delta);
      }
      tokens.input += chunk?.usage?.prompt_tokens || 0;
      tokens.output += chunk?.usage?.completion_tokens || 0;
      addResourceUse({
        ai: {
          [model]: {
            input: chunk?.usage?.prompt_tokens,
            output: chunk?.usage?.completion_tokens,
          },
        },
      });
    }

    this.chatHistory.push(userMessage);
    this.chatHistory.push({ role: "assistant", content: full.trim() });
    this.chatHistory = this.chatHistory.slice(-CHAT_HISTORY_SIZE);

    return {
      message: full.trim(),
      usedTokens: tokens,
    };
  }

  private initOpenAI() {
    return new OpenAI({
      apiKey: atob(import.meta.env.VITE_MOD_K),
      project: atob(import.meta.env.VITE_MOD_P),
      organization: atob(import.meta.env.VITE_MOD_O),
      dangerouslyAllowBrowser: true,
    });
  }
}

const DEFAULT_AI_ACTIONS: ActionsDescription<AIDefaultActions> = {
  add: "when users talk about an item not in the list or asks to add it",
  update: "when users talk about an existing item or asks to modify it",
  remove: "when users asks to remove an existing item",
  // stop: "when users explicitly asks to stop listening",
};

export type AIItemData = {
  id?: string;
  name?: string;
};

export type AIParseResponse = {
  actions: number;
  usedTokens: AITokens;
};

export type AITokens = {
  input: number;
  output: number;
};

export type AIResponse = {
  message: string;
  usedTokens: AITokens;
};

export type AIActionData<A extends string> = {
  action: A;
} & AIItemData;

export type AIDefaultActions = "add" | "update" | "remove" | string;

export type AIItemWithAction<T, Action extends AIDefaultActions> = AIActionData<
  Action | AIDefaultActions
> & Partial<T>;

export type AditionalFieldInfo = {
  /** the name of the field */
  name: string;
  /** the description about what, when and how AI should extract this field */
  description: string;
  /** the type of the field, default will make AI infer the type */
  type?: string;
}

export type ActionsDescription<AIActions extends AIDefaultActions> = {
  /** Key as the action name and value as the action description */
  [key in AIActions]: string;
};

export type AIConfig<A extends AIDefaultActions = AIDefaultActions> = {
  /** Description of the list items */
  listDescription: string;
  /** Description of additional fields to include in the output */
  additionalFields?: AditionalFieldInfo[];
  /** @beta List of actions available for each item, default is ['add', 'update', 'remove'] */
  availableActions?: ActionsDescription<A>;
};

export type AIItemTransformer<T> = (item: Partial<T>) => Partial<T>;
