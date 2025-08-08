import { OpenAI } from 'openai';
import { CreateMLCEngine, MLCEngine, ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import StreamedJsonArrayParser from './StreamedJsonArrayParser';

export type AIResponse<T> = AIItemWithAction<T>[]

export type AIItemData = {
  id?: string;
  name?: string;
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

const STOREAGE_KEY = 'currentGroceryList';
const n = (id: string|undefined|null): string => id?.toString().trim().toLowerCase() || '';

export default class AIActionsParser<T extends AIItemData, A extends string = string> {
  private openai: OpenAI;
  public items: (Partial<T>)[];
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

  public async parse(text: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
You are an action extractor that updates a list of items. Interpret the user's message and produce only a valid JSON array.

Ask something to the user Action Data model:
- action: "ask"
- message: string (a really short and simple question only if need more details about updating the item, otherwise do not ask)

Item Action Data model:
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
- Include only fields explicitly provided by the user. Never use null; omit unknown fields.
- Dates must be in ISO format (YYYY-MM-DD). Resolve relative dates using "today".
- ID generation, use a short id, could be a slug or any unique identifier
- Never alter existing ids for "update" or "remove".
- If the instruction is ambiguous or no actionable item is found, return [] or add an "ask" action with a message.

Context:
- today: ${today}
- list type: ${this.config.listDescription.split('\n').join(', ')}
- current list reference: ${JSON.stringify(
  this.items.map(this.itemContextMap)
).replace(/\n/g, ' ')}

Examples:
${this.config.outputExample.trim()}
`.trim();
    const jsonParser = new StreamedJsonArrayParser<AIItemWithAction<T, A>>(
      (item) => {
        console.log('action:', item);
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
    console.log('AIParserManager prompt:', text, {system: prompt});

    const fullResponse = await this.withOpenAI(prompt, text, (chunk) => {
      // push character-by-character to be conservative with parser expectations
      for (const ch of chunk) jsonParser.push(ch);
    });

    console.log('AIParserManager response (final):', fullResponse);
  }

  private add(item: Partial<T>, index: number): void {
    if (!item.name) return console.error(new Error('Item to add must have a name'), item);
    if (index !== -1) {
      console.warn(`Item with id '${item.id}' already exists, switching add to update`, item);
      return this.update(item, index);
    }
    this.items.push({ ...item });
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
      this.items[index] = { ...current, ...item };
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

  private async withOpenAI(system: string, user: string, onStream?: (chunk: string) => void): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ];

    // Streaming response; still accumulate and return the full text
    const stream = await this.openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages,
      stream: true,
    });

    let full = '';
    for await (const chunk of stream as any) {
      const delta = chunk?.choices?.[0]?.delta?.content ?? '';
      if (delta) {
        full += delta;
        console.log('AIParserManager stream chunk:', delta);
        onStream?.(delta);
      }
    }

    return full;
  }

  private initOpenAI() {
    return new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      project: import.meta.env.VITE_OPENAI_PROJECT,
      organization: import.meta.env.VITE_OPENAI_ORG,
      dangerouslyAllowBrowser: true,
    });
  }
}
