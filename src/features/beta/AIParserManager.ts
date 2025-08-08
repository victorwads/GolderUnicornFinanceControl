import { OpenAI } from 'openai';
import { CreateMLCEngine, MLCEngine, ChatCompletionMessageParam } from '@mlc-ai/web-llm';

export type AIResponse<T> = AIItemWithAction<T>[]
export type AIItem = {
  id: string;
  name?: string;
};

export type AIItemWithAction<T, Action = 'add' | 'update' | 'remove'> = {
  action: Action;
} & AIItem & T;


const STOREAGE_KEY = 'currentGroceryList';
const n = (id: string) => id.trim().toLowerCase();

export default class AIActionsParser<T extends AIItem> {
  private openai: OpenAI;
  private webllm: MLCEngine | null = null;
  private webllmReady: boolean = false;

  public items: (AIItem & Partial<T>)[];
  public onAction: (actions: AIResponse<T>) => void = () => {};

  /**
   * @param language User language
   * @param listDescription Short description of what kind of items are in the list
   * @param outputAditionalFieldsDescription Description of additional fields to include in the output. id and action are already defined.
   * @param normalizer Function to normalize item fields (e.g., convert strings to dates)
   */
  constructor(
    public language: string,
    public listDescription: string,
    public outputAditionalFieldsDescription: string,
    public outputExemple: string,
    public normalizer: (item: Partial<T>) => Partial<T> = (item) => item
  ) {
    this.initOpenAI();

    const savedList = localStorage.getItem(STOREAGE_KEY) || sessionStorage.getItem(STOREAGE_KEY);
    this.items = savedList ? JSON.parse(savedList) : [];
  }

  public async parse(text: string): Promise<AIResponse<T>> {
    const today = new Date().toISOString().split('T')[0];
    const prompt = `
You are an action extractor that updates a list of items. Interpret the user's message written in "${this.language}" and produce only a valid JSON array.

Ask something to the user Action Data model:
- action: "ask"
- message: string (the question to ask the user)

Item Action Data model:
- action: "add" | "update" | "remove"
- id: string (required in every object)
${this.outputAditionalFieldsDescription
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
- list type: ${this.listDescription.split('\n').join(', ')}
- current list reference: ${JSON.stringify(this.items.map(({id, name}) => ({id, name})))}

Examples:
${this.outputExemple.trim()}
`.trim();

    console.log('AIParserManager prompt:', text, {system: prompt});
    const response = await this.withOpenAI(prompt, text);
    console.log('AIParserManager response:', response);

    let actions: AIItemWithAction<T>[] = [];
    try {
      let parsed: unknown;
      try {
        parsed = JSON.parse(response);
      } catch (e) {
        const coerced = this.coerceJsonArray(response);
        if (!coerced) throw e;
        parsed = JSON.parse(coerced);
      }

      actions = Array.isArray(parsed) ? (parsed as AIItemWithAction<T>[]) : [parsed as AIItemWithAction<T>];

      actions.forEach((item: Partial<AIItemWithAction<T>>) => {
        const { id, action } = item;
        if (!id) throw new Error('Item must have an id');

        delete (item as any).action;
        const guardItem = item as Partial<T> & AIItem;
        const normalized = { ...guardItem, ...this.normalizer(guardItem) } as AIItem & Partial<T>;

        let index = this.items.findIndex((i: AIItem) => n(i.id) === n(id));
        switch (action) {
          case 'remove': this.remove(normalized, index); break;
          case 'add': this.add(normalized, index); break;
          case 'update': this.update(normalized, index); break;
          default: throw new Error(`Unknown action: ${action}`);
        }
      });
    } catch(error: unknown) {
      console.error('Failed to parse AI response', error);
      return [];
    }
    this.saveCurrentList();
    return actions;
  }

  private add(item: AIItem & Partial<T>, index: number): void {
    if (!item.name) return console.error(new Error('Item to add must have a name'), item);
    if (index !== -1) {
      console.warn(`Item with id '${item.id}' already exists, switching add to update`, item);
      return this.update(item, index);
    }
    this.items.push({ ...item });
  }

  private update(item: AIItem & Partial<T>, index: number): void {
    if (index === -1) {
      // Try partial id match (both directions)
      index = this.items.findIndex(({id}: AIItem) => n(item.id).includes(n(id)) || n(id).includes(n(item.id)));
      // Fallback by name exact match
      if (index === -1 && item.name) {
        index = this.items.findIndex(({name}: AIItem) => !!name && n(name) === n(item.name!));
      }
      console.warn(`Item with id ${item.id} not found exactly for update, trying to find by partial match or name`, item);
    }
    if (index === -1) {
      console.warn(`Item with id ${item.id} not found for update, switching to add`, item);
      return this.add(item, index);
    } else {
      const current = this.items[index];
      this.items[index] = { ...current, ...item };
      console.log(`Item with id ${item.id} updated from:`, current, 'to:', this.items[index]);
    }
  }

  private remove(item: AIItem, index: number) {
    if (index === -1) {
      console.warn(`Item with id ${item.id} not found for removal`, item);
      return;
    }
    this.items = this.items.filter(({id}: AIItem) => n(id) !== n(item.id));
    this.saveCurrentList();
  }

  private saveCurrentList() {
    localStorage.setItem(STOREAGE_KEY, JSON.stringify(this.items));
  }

  private async withOpenAI(system: string, user: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ];

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-5-nano',
      messages,
      stream: false,
    });

    console.log(`[OpenAI] Tokens usados: `, completion.usage);

    return completion.choices[0]?.message?.content || '';
  }

  private async initOpenAI() {
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      project: import.meta.env.VITE_OPENAI_PROJECT,
      organization: import.meta.env.VITE_OPENAI_ORG,
      dangerouslyAllowBrowser: true,
    });
  }

  // Try to coerce LLM responses into a JSON array string
  private coerceJsonArray(text: string): string | null {
    if (!text) return null;
    let s = text.trim();
    // strip markdown fences
    s = s.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Try to extract array
    const firstBracket = s.indexOf('[');
    const lastBracket = s.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      const candidate = s.slice(firstBracket, lastBracket + 1).trim();
      if (candidate.startsWith('[') && candidate.endsWith(']')) return candidate;
    }

    // Try to extract single object and wrap as array
    const firstBrace = s.indexOf('{');
    const lastBrace = s.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const obj = s.slice(firstBrace, lastBrace + 1).trim();
      if (obj.startsWith('{') && obj.endsWith('}')) return `[${obj}]`;
    }

    return null;
  }
}
