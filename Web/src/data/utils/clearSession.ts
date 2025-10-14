import { signOut } from "firebase/auth";
import { clearIndexedDbPersistence, getFirestore, terminate } from "firebase/firestore";

import { ProjectStorage } from '@utils/ProjectStorage';
import { app, auth, clearFirestore } from "@configs";
import { clearRepositories } from "@repositories";
import { clearServices } from "@services";

export async function clearSession() {
  const db = getFirestore(app);
  await terminate(db)
  await clearIndexedDbPersistence(db);
  await clearFirestore();
  clearRepositories();
  clearServices();
  signOut(auth);
  ProjectStorage.clear();
  window.location.reload();
}