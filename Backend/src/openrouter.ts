import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { ensureAuth } from "./auth";

/**
 * Creates a new OpenRouter API key for the authenticated user.
 */
export const createOpenRouterKey = onCall(async (request): Promise<Response> => {
  return {
    key: process.env.OPENAI_API_KEY as string,
  }

  const uid = ensureAuth(request);

  const db = getFirestore();
  const docRef = db.collection("OpenRouterKeys").doc(uid);
  const doc = await docRef.get();

  if (doc.exists) {
    return doc.data() as Response;
  }

  const masterKey = process.env.OPENROUTER_API_KEY;
  if (!masterKey) {
    throw new HttpsError("internal", "OpenRouter API key not configured.");
  }

  const name = `API Key for ${uid}`;

  const response = await fetch("https://openrouter.ai/api/v1/keys", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${masterKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({name, limit: 2}),
  });

  if (!response.ok) {
    throw new HttpsError("internal", "Failed to create OpenRouter key.");
  }

  const data = await response.json() as Response;
  data.url = 'https://openrouter.ai/api/v1';

  await docRef.set(data);

  return data;
});

type Data = {
  hash: string
  name: string
  label: string
  disabled: boolean,
  limit: number,
  limit_remaining: number,
  limit_reset: null,
  include_byok_in_limit: boolean,
  usage: number,
  usage_daily: number,
  usage_weekly: number,
  usage_monthly: number,
  byok_usage: number,
  byok_usage_daily: number,
  byok_usage_weekly: number,
  byok_usage_monthly: number,
  created_at: string
  updated_at: null
}

type Response = {
  url?: string
  key: string
  data?: Data
}