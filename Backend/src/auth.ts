import {CallableRequest, HttpsError} from "firebase-functions/v2/https";

function ensureAuth(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "Usuário não autenticado.");
  }
  return uid;
}

export {ensureAuth};
