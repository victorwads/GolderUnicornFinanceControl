
import {getApps, initializeApp} from "firebase-admin/app";
import {getAuth, type UserRecord} from "firebase-admin/auth";

const DEV_BOOT_USERS = [
  {
    uid: "fUztrRAGqQZ3lzT5AmvIki5x0443",
    email: "victor@wads.dev",
    googleProviderId: "google.com",
    googleProviderUid: "fUztrRAGqQZ3lzT5AmvIki5x0443-google",
    profileURL: "https://media.licdn.com/dms/image/v2/D4D03AQGfJFPnW2og6g/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1724770788294?e=1762387200&v=beta&t=OhHL_aEpgc0RJ_YWU8oAaB4YbwCN7x6IOTU_FzGphxg"
  },
  {
    uid: "vdtrRfdsdgdsgT5AmvfeFSSGVSD",
    email: "empty@wads.dev",
    googleProviderId: "google.com",
    googleProviderUid: "vdtrRfdsdgdsgT5AmvfeFSSGVSD-google",
  },
  {
    uid: "adminuseruid00000000000000",
    email: "rafa@wads.dev",
    googleProviderId: "google.com",
    googleProviderUid: "adminuseruid00000000000000-google",
    profileURL: "https://media.licdn.com/dms/image/v2/C5603AQFfs45hJE2Bfg/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1637717820330?e=1762387200&v=beta&t=7lSqUjFy24CqrOOE00ofCf-LzUDaGpgHLQ6D2d8bjeM"
  }
];

async function ensureGoogleProviderLink(auth = getAuth(), userRecord: UserRecord, user: typeof DEV_BOOT_USERS[number]): Promise<void> {
  const record = userRecord;
  const hasGoogleProvider = record.providerData.some(
    (provider) => provider?.providerId === user.googleProviderId,
  );
  if (hasGoogleProvider) {
    return;
  }
  try {
    await auth.updateUser(user.uid, {
      photoURL: user.profileURL,
      providerToLink: {
        providerId: user.googleProviderId,
        uid: user.googleProviderUid,
        email: user.email,
        displayName: record.displayName ?? user.email,
        photoURL: user.profileURL,
      },
    });
    console.info(
      `[dev] Linked Google OAuth provider to Firebase Auth emulator user`,
      user.email,
    );
  } catch (error) {
    const code = (error as {code?: string}).code;
    if (code !== "auth/credential-already-in-use" && code !== "auth/provider-already-linked") {
      console.error(`[dev] Failed to link Google OAuth provider for ${user.email}`, error);
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
  for (const user of DEV_BOOT_USERS) {
    let userRecord: UserRecord | undefined;
    try {
      userRecord = await auth.getUser(user.uid);
      if (userRecord.email !== user.email) {
        await auth.updateUser(user.uid, {
          email: user.email,
        });
      }
      await ensureGoogleProviderLink(auth, userRecord, user);
      continue;
    } catch (error) {
      const code = (error as {code?: string}).code;
      if (code !== "auth/user-not-found") {
        console.error(`[dev] Failed to verify bootstrap auth user ${user.email}`, error);
        continue;
      }
    }
    try {
      await auth.createUser({
        uid: user.uid,
        email: user.email,
        emailVerified: true,
        photoURL: user.profileURL,
      });
      console.info(`[dev] Created Firebase Auth emulator user`, user.email);
      // Buscar o registro recém-criado para garantir o link
      userRecord = await auth.getUser(user.uid);
      await ensureGoogleProviderLink(auth, userRecord, user);
    } catch (error) {
      const code = (error as {code?: string}).code;
      if (code !== "auth/uid-already-exists" && code !== "auth/email-already-exists") {
        console.error(`[dev] Failed to create bootstrap auth user ${user.email}`, error);
      }
    }
  }
}
