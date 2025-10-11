import { onCall, HttpsError } from "firebase-functions/v2/https";
import { getFirestore } from "firebase-admin/firestore";
import { ensureAuth } from "./auth";

/**
 * Creates a new OpenRouter API key for the authenticated user.
 */
export const createOpenRouterKey = onCall(async (request) => {
  const uid = ensureAuth(request);

  const db = getFirestore();
  const docRef = db.collection("OpenRouterKeys").doc(uid);
  const doc = await docRef.get();

  if (doc.exists) {
    return doc.data();
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
      "Content-Type": "application/json",
    },
    body: JSON.stringify({name, limit: 2}),
  });

  if (!response.ok) {
    throw new HttpsError("internal", "Failed to create OpenRouter key.");
  }

  const data = await response.json();

  await docRef.set(data);

  return data;
});