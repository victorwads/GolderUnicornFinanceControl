import { OpenAI } from 'openai';
import { getApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

import { ProjectStorage } from '@utils/ProjectStorage';

const OPENROUTER_API_KEY_STORAGE_KEY = 'ai_api_key';
const OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

function normalizeOpenRouterUrl(url?: string | null): string {
  if (typeof url !== "string") {
    return OPENROUTER_BASE_URL;
  }

  const normalized = url.trim();
  if (!normalized) {
    return OPENROUTER_BASE_URL;
  }

  return normalized;
}

async function getOpenRouterApiKey(): Promise<{
  key: string;
  url: string;
}> {
  const storedKey = JSON.parse(ProjectStorage.getSession(OPENROUTER_API_KEY_STORAGE_KEY) || 'null') as Store | null;
  if (storedKey && storedKey.key) {
    const normalizedStoredKey: Store = {
      key: storedKey.key,
      url: normalizeOpenRouterUrl(storedKey.url),
    };

    if (normalizedStoredKey.url !== storedKey.url) {
      ProjectStorage.setSession(OPENROUTER_API_KEY_STORAGE_KEY, JSON.stringify(normalizedStoredKey));
    }

    return normalizedStoredKey;
  }

  const functions = getFunctions(getApp());
  const createOpenRouterKey = httpsCallable(functions, 'createOpenRouterKey');
  const result = await createOpenRouterKey();

  if (result.data && typeof result.data === 'object' && 'key' in result.data) {
    const rawData = result.data as Partial<Store> & { key: string };
    const storedKey: Store = {
      key: rawData.key,
      url: normalizeOpenRouterUrl(rawData.url),
    };

    ProjectStorage.setSession(OPENROUTER_API_KEY_STORAGE_KEY, JSON.stringify(storedKey));
    return storedKey;
  }

  throw new Error('Failed to obtain OpenRouter API key');
}

export async function createOpenAIClient(): Promise<OpenAI> {
  const { key, url } = await getOpenRouterApiKey();

  return new OpenAI({
    baseURL: normalizeOpenRouterUrl(url),
    apiKey: key,
    dangerouslyAllowBrowser: true,
  });
}

type Store = {
  key: string;
  url: string;
}
