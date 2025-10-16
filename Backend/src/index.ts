import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { setGlobalOptions } from "firebase-functions";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { bootstrapDevelopmentAuthUser } from "./boot.dev";

import {
  signPayload,
  verifyToken,
  buildPayload,
  assertPayloadForUid,
  decryptPassword,
} from "./crypto";
import { ensureAuth } from "./auth";
import { EncryptPayload, DecryptPayload } from "./types";

const USER_COLLECTION = "Users";
const RESOURCES_USE_COLLECTION = "ResourcesUse";
const OPEN_ROUTER_KEYS_COLLECTION = "OpenRouterKeys";

if (process.env.NODE_ENV !== 'test') {
  initializeApp();
}
setGlobalOptions({ maxInstances: 10 });

void bootstrapDevelopmentAuthUser();

export const cryptoPassEncrypt = onCall<EncryptPayload, DecryptPayload>(
  (request) => {
    const uid = ensureAuth(request);
    const secretHash = request.data?.secretHash ?? "";

    if (!secretHash) {
      throw new HttpsError("invalid-argument", "secretHash is required.");
    }

    const payload = buildPayload(uid, secretHash);
    const token = signPayload(payload);
    return { token };
  }
);

export const cryptoPassDecrypt = onCall<DecryptPayload, EncryptPayload>(
  (request) => {
    const uid = ensureAuth(request);
    const token = request.data?.token ?? "";

    if (!token) {
      throw new HttpsError("invalid-argument", "token is required.");
    }

    const payload = verifyToken(token);
    assertPayloadForUid(uid, payload);
    const secretHash = decryptPassword(uid, payload);
    return { secretHash };
  }
);

export const deleteAccountData = onCall(async (request) => {
  const uid = ensureAuth(request);
  const db = getFirestore();
  const auth = getAuth();

  try {
    const userDocRef = db.collection(USER_COLLECTION).doc(uid);
    const resourcesDocRef = db.collection(RESOURCES_USE_COLLECTION).doc(uid);
    const openRouterDocRef = db.collection(OPEN_ROUTER_KEYS_COLLECTION).doc(uid);

    await Promise.all([
      db.recursiveDelete(userDocRef),
      db.recursiveDelete(resourcesDocRef),
      db.recursiveDelete(openRouterDocRef),
    ]);

    try {
      await auth.deleteUser(uid);
    } catch (error: any) {
      if (error?.code !== "auth/user-not-found") {
        throw error;
      }
    }

    return { success: true as const };
  } catch (error) {
    console.error("Failed to delete account data", error);
    throw new HttpsError("internal", "Failed to delete account data.");
  }
});

export { createOpenRouterKey } from "./openrouter";
