import { QuantityUnit } from '@models';
import { OpenAI } from 'openai';
import { CreateMLCEngine, MLCEngine, ChatCompletionMessageParam } from '@mlc-ai/web-llm';

export type AIResponseItem = {
  id: string; // identifying the same product between action calls
  name?: string; // should be the formated product name
};

export type AIResponseAction = {
  action: 'add' | 'update' | 'remove';
} & AIResponseItem;

export type AIGroceryItem = AIResponseItem & {
  price?: number; // price paid for each unit
  quantity?: number; // optional
  units?: QuantityUnit; // un|kg|g|l|ml
  expirationDate?: string | Date; // ISO Date
};

export type AIResponse<T extends AIResponseItem> = T[]

const STOREAGE_KEY = 'currentGroceryList';

export default class AIParserManager {
  private openai: OpenAI;
  private currentList: AIResponseItem[];

  private webllm: MLCEngine | null = null;
  private webllmReady: boolean = false;

  constructor() {
    this.openai = new OpenAI({ 
      apiKey: "",
      project: "",
      organization: "",
      dangerouslyAllowBrowser: true,
    });

    const savedList = localStorage.getItem(STOREAGE_KEY) || sessionStorage.getItem(STOREAGE_KEY);
    this.currentList = savedList ? JSON.parse(savedList) : [];
  }

  public async parse(text: string): Promise<AIResponse<AIGroceryItem>> {
    const currentList = this.currentList;
    const prompt = `
analyze input and extract a list of actions for whether the user adds, updates, or removes items.
exemple: [{
  action: string, # add | update | remove
  id: string, # snake_case identify same item across actions
  name: string, # commercial product name, if more info is provided use brand, size, flavor, etc.
  paidPrice?: number,
  unit?: string, # un | kg | g | l | ml
  quantity?: number,
  expirationDate?: string # ISO
  location?: string, # where the item is stored
  }]

output only one valid JSON array of actions.

Context:
- Current date: ${new Date().toISOString()}.
- Current list: ${JSON.stringify(
  this.currentList.map(({id, name}) => ({id, name}))
)}
`;

    const response = await this.withOpenAI(prompt, text);
    console.log('AIParserManager response:', response);

    let result: AIGroceryItem[] = [...currentList];
    try {
      JSON.parse(response).forEach((item: Partial<AIResponseAction & AIGroceryItem>) => {
        const { id, name, action, expirationDate } = item;
        delete item.action;

        if (!id) throw new Error('Item must have an id');
        if (expirationDate) item.expirationDate = new Date(expirationDate);

        switch (action) {
          case 'add':
            if (!name) throw new Error('Item must have a name');
            result.push({ ...item, id, name});
            break;
          case 'remove':
            result = result.filter((i) => i.id !== id);
            break;
          case 'update':
            let index = result.findIndex((i) => i.id === id);
            if (index === -1) result.findIndex((i) => i.id.includes(id));
            if (index === -1) throw new Error(`Item with id ${id} not found for update`);
            result[index] = { ...result[index], ...item };
            break;
          default:
            throw new Error(`Unknown action: ${action}`);
        }
      });
    } catch(error: unknown) {
      console.error('Failed to parse AI response:', response, error);
    }
    this.saveCurrentList(result);
    return this.list;
  }

  private saveCurrentList(list: AIResponseItem[]) {
    this.currentList = list;
    localStorage.setItem(STOREAGE_KEY, JSON.stringify(list));
  }


  private async withOpenAI(system: string, user: string): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user }
      ],
      temperature: 0.2,
      max_tokens: 512,
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
      max_tokens: 512,
      temperature: 0.2,
      response_format: {
        type: 'json_object',
      },

    });
    return reply.choices[0]?.message?.content || '';
  }

  private async initWebLLM() {
    try {
      // Nome do modelo pode ser ajustado conforme disponível localmente
      const selectedModel = 'DeepSeek-R1-Distill-Qwen-7B-q4f16_1-MLC';
      this.webllm = await CreateMLCEngine(selectedModel, {
        initProgressCallback: (progress) => {
          // Pode logar ou exibir progresso
          console.log('web-llm progress:', progress);
        }
      });
      this.webllmReady = true;
    } catch (e) {
      console.error('Erro ao inicializar web-llm:', e);
      this.webllmReady = false;
    }
  }

  public get list() {
    return this.currentList.map((item: AIGroceryItem) => ({
      ...item,
      expirationDate: item.expirationDate ? new Date(item.expirationDate) : undefined
    }));
  }
}
