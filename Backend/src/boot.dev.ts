import {getApps, initializeApp} from "firebase-admin/app";
import {getAuth, type UserRecord} from "firebase-admin/auth";

const DEV_BOOT_USER_UID = "fUztrRAGqQZ3lzT5AmvIki5x0443";
const DEV_BOOT_USER_EMAIL = "test@wads.dev";
const DEV_BOOT_GOOGLE_PROVIDER_ID = "google.com";
const DEV_BOOT_GOOGLE_PROVIDER_UID = `${DEV_BOOT_USER_UID}-google`;

async function ensureGoogleProviderLink(auth = getAuth(), userRecord?: UserRecord): Promise<void> {
  const record = userRecord ?? (await auth.getUser(DEV_BOOT_USER_UID));

  const hasGoogleProvider = record.providerData.some(
    (provider) => provider?.providerId === DEV_BOOT_GOOGLE_PROVIDER_ID,
  );

  if (hasGoogleProvider) {
    return;
  }

  try {
    await auth.updateUser(DEV_BOOT_USER_UID, {
      providerToLink: {
        providerId: DEV_BOOT_GOOGLE_PROVIDER_ID,
        uid: DEV_BOOT_GOOGLE_PROVIDER_UID,
        email: DEV_BOOT_USER_EMAIL,
        displayName: record.displayName ?? DEV_BOOT_USER_EMAIL,
      },
    });
    console.info(
      "[dev] Linked Google OAuth provider to Firebase Auth emulator user",
      DEV_BOOT_USER_EMAIL,
    );
  } catch (error) {
    const code = (error as {code?: string}).code;
    if (code !== "auth/credential-already-in-use" && code !== "auth/provider-already-linked") {
      console.error("[dev] Failed to link Google OAuth provider", error);
    }
  }
}

export async function bootstrapDevelopmentAuthUser(): Promise<void> {
  const isDevelopmentRuntime =
    process.env.NODE_ENV === "development" || process.env.FUNCTIONS_EMULATOR === "true";

  if (!isDevelopmentRuntime) {
    return;
  }

  if (!process.env.FIREBASE_AUTH_EMULATOR_HOST) {
    return;
  }

  if (!getApps().length) {
    initializeApp();
  }

  const auth = getAuth();

  try {
    const userRecord = await auth.getUser(DEV_BOOT_USER_UID);
    if (userRecord.email !== DEV_BOOT_USER_EMAIL) {
      await auth.updateUser(DEV_BOOT_USER_UID, {email: DEV_BOOT_USER_EMAIL});
    }
    await ensureGoogleProviderLink(auth, userRecord);
    return;
  } catch (error) {
    const code = (error as {code?: string}).code;
    if (code !== "auth/user-not-found") {
      console.error("[dev] Failed to verify bootstrap auth user", error);
      return;
    }
  }

  try {
    await auth.createUser({
      uid: DEV_BOOT_USER_UID,
      email: DEV_BOOT_USER_EMAIL,
      emailVerified: true,
    });
    console.info("[dev] Created Firebase Auth emulator user", DEV_BOOT_USER_EMAIL);
    await ensureGoogleProviderLink();
  } catch (error) {
    const code = (error as {code?: string}).code;
    if (code !== "auth/uid-already-exists" && code !== "auth/email-already-exists") {
      console.error("[dev] Failed to create bootstrap auth user", error);
    }
  }
}
