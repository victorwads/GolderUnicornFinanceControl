import {onCall, HttpsError} from "firebase-functions/v2/https";
import {DocumentReference, getFirestore} from "firebase-admin/firestore";
import {getAuth} from "firebase-admin/auth";
import {ensureAuth} from "../utils/auth";

const USD_TO_BRL = 5.6;
const BRL_LIMIT = 5;
const USD_LIMIT = BRL_LIMIT / USD_TO_BRL;
const Collections = {
  OpenRouterKeys: "OpenRouterKeys",
};

export const createOpenRouterKey = onCall(async (request): Promise<Response> => {
  const uid = ensureAuth(request);
  const auth = getAuth();

  const db = getFirestore();
  const docRef = db.collection(Collections.OpenRouterKeys).doc(uid);
  const doc = await docRef.get();

  if (doc.exists) {
    const data: BdData = await doc.data() as BdData;
    updateUsageData(docRef, data);
    return {
      key: data.key,
    };
  }

  const masterKey = process.env.OPENROUTER_API_KEY;
  if (!masterKey) {
    throw new HttpsError("internal", "OpenRouter API key not configured.");
  }

  const user = await auth.getUser(uid);
  const name = `User: ${uid} - ${user.email ?? user.displayName ?? "Unknown"}`;

  const response = await fetch("https://openrouter.ai/api/v1/keys", {
    method: "POST",
    headers: getOpenRouterHeaders(),
    body: JSON.stringify({
      name,
      limit: USD_LIMIT,
      include_byok_in_limit: true,
    }),
  });

  if (!response.ok) {
    throw new HttpsError("internal", "Failed to create OpenRouter key.");
  }

  const data = await response.json() as Response;
  data.url = "https://openrouter.ai/api/v1";

  await docRef.set(data);

  return data;
});

async function updateUsageData(docRef: DocumentReference, data: BdData): Promise<void> {
  const response = await fetch(`https://openrouter.ai/api/v1/keys/${data.key}`, {
    method: "GET",
    headers: getOpenRouterHeaders(),
  });

  if (!response.ok) {
    return console.error(`Failed to fetch usage data for key ${data.key}`);
  }

  const updatedData = await response.json() as Response;
  await docRef.update({
    data: updatedData.data,
  });
}

function getOpenRouterHeaders() {
  return {
    "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
    "Content-Type": "application/json",
  };
}

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

type BdData = {
  key: string
  data: Data
}

type Response = {
  url?: string
  key: string
  data?: Data
}
