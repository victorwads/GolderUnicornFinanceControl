import { FieldValue } from "firebase-admin/firestore";
import { current } from "./utils/defaultdb";

async function main() {
  try {
    const usersSnapshot = await current.collection("Users").get();
    console.log(`Found ${usersSnapshot.size} users.`);

    for (const doc of usersSnapshot.docs) {
      const userId = doc.id;
      const data = doc.data();
      const dbUse = (data as any).dbUse;

      if (dbUse === undefined) {
        console.warn(`User ${userId} has no dbUse field, skipping.`);
        continue;
      }

      const legacy = dbUse.openai
        ? {
            requests: dbUse.openai.requests,
            input: dbUse.openai.tokens?.input,
            output: dbUse.openai.tokens?.output,
          }
        : undefined;

      const resourceRef = current.collection("ResourcesUse").doc(userId);
      await resourceRef.set({
        ai: {
          ...dbUse.ai,
          legacy: legacy,
        },
        db: {
          remote: dbUse.remote,
          local: dbUse.local,
          cache: dbUse.cache,
        },
      });
      console.log(`Migrated dbUse for user ${userId}`);
    }

    console.log("ResourceUse migration completed successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main();
