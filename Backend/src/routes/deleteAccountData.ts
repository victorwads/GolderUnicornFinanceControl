import {getAuth} from "firebase-admin/auth";
import {getFirestore} from "firebase-admin/firestore";
import {onCall, HttpsError} from "firebase-functions/v2/https";

import {ensureAuth} from "../utils/auth";

const USER_COLLECTION = "Users";
const RESOURCES_USE_COLLECTION = "ResourcesUse";
const OPEN_ROUTER_KEYS_COLLECTION = "OpenRouterKeys";

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
    } catch (error: unknown) {
      console.error("Failed to delete user from Firebase Auth", error);
    }

    return {success: true as const};
  } catch (error) {
    console.error("Failed to delete account data", error);
    throw new HttpsError("internal", "Failed to delete account data.");
  }
});
