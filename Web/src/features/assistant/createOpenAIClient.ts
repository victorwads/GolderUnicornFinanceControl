import { OpenAI } from 'openai';

export function createOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: atob(import.meta.env.VITE_MOD_K),
    project: atob(import.meta.env.VITE_MOD_P),
    organization: atob(import.meta.env.VITE_MOD_O),
    dangerouslyAllowBrowser: true,
  });
}
