import { app, auth, clearFirestore } from "@configs";
import { clearRepositories } from "@repositories";
import { clearServices } from "@services";
import { signOut } from "firebase/auth";
import { clearIndexedDbPersistence, getFirestore, terminate } from "firebase/firestore";

export async function clearSession() {
  const db = getFirestore(app);
  await terminate(db)
  await clearIndexedDbPersistence(db);
  await clearFirestore();
  clearRepositories();
  clearServices();
  signOut(auth);
  window.location.reload();
}