import { OpenAI } from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/index';

import StreamedJsonArrayParser from './StreamedJsonArrayParser';
import RepositoryBase from '../../data/repositories/RepositoryBase';

type Model = 'gpt-5-nano' | 'gpt-5-mini' | 'gpt-4_1-nano';
const STOREAGE_KEY = 'currentGroceryList';
const CHAT_HISTORY_SIZE = 2;
const n = (id: string|undefined|null): string => id?.toString().trim().toLowerCase() || '';

export default class AIActionsParser<T extends AIItemData, A extends string = string> {
  private openai: OpenAI;
  private chatHistory: ChatCompletionMessageParam[] = [];

  public items: (Partial<T> & { glow?: boolean })[];
  public onAction: (action: AIItemWithAction<T, A>) => void = () => {};

  /**
   * @param normalizer Function to normalize item fields (e.g., convert strings to dates)
   */
  constructor(
    private config: AIConfig,
    private normalizer: AIItemTransformer<T> = (item) => item,
    private itemContextMap: AIItemTransformer<T> = ({id, name}) => ({id, name} as Partial<T>),
  ) {
    const savedList = localStorage.getItem(STOREAGE_KEY) || sessionStorage.getItem(STOREAGE_KEY);
    this.items = savedList ? JSON.parse(savedList) : [];
    this.openai = this.initOpenAI();
  }

  public async parse(text: string): Promise<AIParseResponse> {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
You are a personal assistant that helps users manage a list of items sending actions to the front-end interface with JSON objects for each action. no text.

Each action object is like:
- action: "add" | "update" | "remove"
- id: string (required in every object)
${this.config.outputAditionalFieldsDescription
  .trim()
  .replace(/^\s-\s/, '')
  .split('\n')
  .map(line => `- ${line.trim()}`)
  .join('\n')
}

Rules:
- Include only fields related with the user input. Never use null unless a field needs removal.
- Dates must be in ISO format. For relative dates use "today".
- When adding, give numeric unique id.
- If the instruction is ambiguous, return []

Context:
- today: ${today}
- list type: ${this.config.listDescription.split('\n').join(', ')}
- current list reference: ${JSON.stringify(
  this.items.map(this.itemContextMap)
).replace(/\n/g, ' ')}
`.trim();
// Examples:
// ${this.config.outputExample.trim()}
// `.trim();

    let actionsFound = 0;

    this.items.forEach(item => {
      delete item.glow;
    });

    const jsonParser = new StreamedJsonArrayParser<AIItemWithAction<T, A>>(
      (item) => {
        console.log('action:', item);
        actionsFound++;
        const { id, action } = item;
        if (action === 'ask') {
          this.onAction(item);
          return;
        }
        if (!id) throw new Error('Item must have an id');

        delete (item as any).action;
        const normalized = { ...item, ...this.normalizer(item) } as Partial<T>;

        let index = this.items.findIndex((i) => n(i.id) === n(id));
        switch (action) {
          case 'remove': this.remove(normalized, index); break;
          case 'add': this.add(normalized, index); break;
          case 'update': this.update(normalized, index); break;
          default: throw new Error(`Unknown action: ${action}`);
        }
        this.saveCurrentList();
        this.onAction(item);
      }
    );

    const fullResponse = await this.withOpenAI(prompt, text, (chunk) => {
      for (const ch of chunk) jsonParser.push(ch);
    });

    console.log('AIParserManager response (final):', fullResponse);

    return {
      actionsFound,
      usedTokens: fullResponse.usedTokens
    };
  }

  private add(item: Partial<T>, index: number): void {
    if (!item.name) return console.error(new Error('Item to add must have a name'), item);
    if (index !== -1) {
      console.warn(`Item with id '${item.id}' already exists, switching add to update`, item);
      return this.update(item, index);
    }
    this.items.push({ ...item, glow: true });
  }

  private update(item: Partial<T>, index: number): void {
    if (index === -1) {
      // Try partial id match (both directions)
      index = this.items.findIndex(({id}) => n(item?.id).includes(n(id)) || n(id).includes(n(item.id)));
      console.warn(`Item with id ${item.id} not found exactly for update, trying to find by partial match`, item);
    }
    if (index === -1) {
      console.warn(`Item with id ${item.id} not found for update, switching to add`, item);
      return this.add(item, index);
    } else {
      const current = this.items[index];
      this.items[index] = { ...current, ...item, glow: true };
    }
  }

  private remove(item: Partial<T>, index: number) {
    if (index === -1) {
      console.warn(`Item with id ${item.id} not found for removal`, item);
      return;
    }
    this.items = this.items.filter(({id}) => n(id) !== n(item.id));
    this.saveCurrentList();
  }

  private saveCurrentList() {
    localStorage.setItem(STOREAGE_KEY, JSON.stringify(this.items));
  }

  private async withOpenAI(system: string, user: string, onStream?: (chunk: string) => void): Promise<AIResponse> {
    const userMessage: ChatCompletionMessageParam = { role: 'user', content: user };
    const messages: Array<ChatCompletionMessageParam> = [
      { role: 'system', content: system },
      ...this.chatHistory.slice(-CHAT_HISTORY_SIZE),
      userMessage
    ];

    console.log('AIParserManager withOpenAI messages:', messages);
    const model: Model = 'gpt-5-nano';
    const stream = await this.openai.chat.completions.create({
      model,
      messages,
      stream: true,
      stream_options: { include_usage: true },
    });

    let full = '';
    let tokens = {
      input: 0,
      output: 0
    };
    for await (const chunk of stream) {
      const delta = chunk?.choices?.[0]?.delta?.content ?? '';
      if (delta) {
        full += delta;
        onStream?.(delta);
      }
      tokens.input += chunk?.usage?.prompt_tokens || 0;
      tokens.output += chunk?.usage?.completion_tokens || 0;
    }

    RepositoryBase.addUse({
      ai: {
        [model]: {
          ...tokens,
          requests: 1
        }
      }
    });

    this.chatHistory.push(userMessage);
    this.chatHistory.push({ role: 'assistant', content: full.trim() });
    this.chatHistory = this.chatHistory.slice(-CHAT_HISTORY_SIZE);

    return {
      message: full.trim(),
      usedTokens: tokens,
    };
  }

  private initOpenAI() {
    return new OpenAI({
      apiKey: import.meta.env.VITE_MOD_K,
      project: import.meta.env.VITE_MOD_P,
      organization: import.meta.env.VITE_MOD_O,
      dangerouslyAllowBrowser: true,
    });
  }
}

export type AIItemData = {
  id?: string;
  name?: string;
}

export type AIParseResponse = {
  actionsFound: number;
  usedTokens: AITokens;
}

export type AITokens = {
  input: number;
  output: number;
}

export type AIResponse = {
  message: string;
  usedTokens: AITokens;
}

export type AIActionData<A extends string = string> = {
  action: A;
} & AIItemData;

export type AIItemWithAction<T, Action extends string = string> = 
  AIActionData<Action | 'add' | 'update' | 'remove' | 'ask'> & Partial<T>;

export type AIConfig = {
  /** Description of the list items */
  listDescription: string;
  /** Description of additional fields to include in the output */
  outputAditionalFieldsDescription: string;
  /** Example of the output format */
  outputExample: string;
}

export type AIItemTransformer<T> = (item: Partial<T>) => Partial<T>;
