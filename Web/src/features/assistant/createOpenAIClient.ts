import { OpenAI } from 'openai';
import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { ProjectStorage } from '@utils/ProjectStorage';

const OPENROUTER_API_KEY_STORAGE_KEY = 'ai_api_key';

async function getOpenRouterApiKey(): Promise<{
  key: string;
  url: string;
}> {
  const storedKey = JSON.parse(ProjectStorage.getSession(OPENROUTER_API_KEY_STORAGE_KEY) || 'null') as Store | null;
  if (storedKey && storedKey.key) {
    return storedKey;
  }

  const functions = getFunctions(getApp());
  const createOpenRouterKey = httpsCallable(functions, 'createOpenRouterKey');
  const result = await createOpenRouterKey();

  if (result.data && typeof result.data === 'object' && 'key' in result.data) {
    const storedKey = result.data as Store;
    ProjectStorage.setSession(OPENROUTER_API_KEY_STORAGE_KEY, JSON.stringify(storedKey));
    return storedKey;
  }

  throw new Error('Failed to obtain OpenRouter API key');
}

export async function createOpenAIClient(): Promise<OpenAI> {
  const { key, url } = await getOpenRouterApiKey();

  return new OpenAI({
    baseURL: url,
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });
}

type Store = {
  key: string;
  url: string;
}
