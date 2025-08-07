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
    public normalizer: (item: Partial<T>) => Partial<T> = (item) => item
  ) {
    this.openai = new OpenAI({ 
      apiKey: "",
      project: "",
      organization: "",
      dangerouslyAllowBrowser: true,
    });

    const savedList = localStorage.getItem(STOREAGE_KEY) || sessionStorage.getItem(STOREAGE_KEY);
    this.items = savedList ? JSON.parse(savedList) : [];
  }

  public async parse(text: string): Promise<AIResponse<T>> {
    const prompt = `
# Output Array Item Fields
action (add | update | remove )
id (unique simple short id)
${this.outputAditionalFieldsDescription.trim()}

# Context
You are list (${
  this.listDescription.split('\n').join(', ')
}) assistant, analyze the user's input to extract actions for each item to update the list.

include fields only if the user explicit provided that information.
never use null unless the user explicitly rectifies some info.
dates should be handled in ISO Format.

today: ${new Date().toISOString().split('T')[0]}
list: ${JSON.stringify(
  this.items.map(({id, name}) => ({id, name}))
)}
`;

    console.log('AIParserManager prompt:', prompt);
    const response = await this.withOpenAI(prompt, text);
    console.log('AIParserManager response:', response);

    let actions: AIItemWithAction<T>[] = [];
    try {
      actions = JSON.parse(response);
      actions.forEach((item: Partial<AIItemWithAction<T>>) => {
        const { id, action } = item;
        if (!id) throw new Error('Item must have an id');

        delete item.action;
        let guardItem = item as Partial<T> & AIItem;

        let index = this.items.findIndex((i: AIItem) => n(i.id) === n(id));
        switch (action) {
          case 'remove': this.remove(guardItem, index); break;
          case 'add': this.add(guardItem, index); break;
          case 'update': this.update(guardItem, index); break;
          default: throw new Error(`Unknown action: ${action}`);
        }
      });
    } catch(error: unknown) {
      console.error('Failed to parse AI response:', response, error);
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
      index = index !== -1 ? index : this.items.findIndex(({id}: AIItem) => n(item.id).includes(n(id)));
      console.warn(`Item with id ${item.id} not found exactly for update, trying to find by partial match`, item);
    }
    if (index === -1) {
      console.warn(`Item with id ${item.id} not found for update, switching to add`, item);
      return this.add(item, index);
    } else {
      this.items[index] = { ...this.items[index], ...item };
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
      model: 'gpt-4.1-nano',
      messages,
      stream: false,
      max_tokens: 1024,
      temperature: 0.01,
      top_p: 0.3,
    });
    return completion.choices[0]?.message?.content || '';
  }

  private async withWebLLM(system: string, user: string): Promise<string> {
    if (!this.webllmReady || !this.webllm) {
      throw new Error('web-llm não está pronto. Aguarde a inicialização.');
    }
    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: system },
      { role: 'user', content: user }
    ];
    const reply = await this.webllm.chat.completions.create({
      messages,
      stream: false,
      max_tokens: 1024, // Ajust depeding of user paid plan
      temperature: 0.01,
      top_p: 0.3,
    });
    return reply.choices[0]?.message?.content || '';
  }

  private async initWebLLM() {
    try {
      const selectedModel = 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC';
      this.webllm = await CreateMLCEngine(selectedModel, {
        initProgressCallback: (progress) => {
          console.log('web-llm progress:', progress);
        }
      });
      this.webllmReady = true;
    } catch (e) {
      console.error('Erro ao inicializar web-llm:', e);
      this.webllmReady = false;
    }
  }
}
