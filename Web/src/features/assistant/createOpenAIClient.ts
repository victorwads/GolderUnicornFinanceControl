import { OpenAI } from 'openai';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';

const OPENROUTER_API_KEY_STORAGE_KEY = 'openrouter_api_key';

async function getOpenRouterApiKey(): Promise<string> {
  const storedKey = sessionStorage.getItem(OPENROUTER_API_KEY_STORAGE_KEY);
  if (storedKey) {
    return storedKey;
  }

  const functions = getFunctions(getApp());
  const createOpenRouterKey = httpsCallable(functions, 'createOpenRouterKey');
  const result = await createOpenRouterKey();

  if (result.data && typeof result.data === 'object' && 'key' in result.data) {
    const apiKey = (result.data as { key: string }).key;
    sessionStorage.setItem(OPENROUTER_API_KEY_STORAGE_KEY, apiKey);
    return apiKey;
  }

  throw new Error('Failed to obtain OpenRouter API key');
}

export async function createOpenAIClient(): Promise<OpenAI> {
  const apiKey = await getOpenRouterApiKey();

  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    dangerouslyAllowBrowser: true,
  });
}
