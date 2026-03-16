import {initializeApp} from "firebase-admin/app";
import {setGlobalOptions} from "firebase-functions";
import {bootstrapDevelopmentAuthUser} from "./utils/boot.dev";

import {cryptoPassDecrypt, cryptoPassEncrypt} from "./routes/cryptoPass";
import {deleteAccountData} from "./routes/deleteAccountData";

if (process.env.NODE_ENV !== "test") {
  initializeApp();
}
setGlobalOptions({maxInstances: 10});

void bootstrapDevelopmentAuthUser();

export {cryptoPassEncrypt, cryptoPassDecrypt, deleteAccountData};
export {createOpenRouterKey} from "./routes/openrouter";
