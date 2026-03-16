import {onCall, HttpsError} from "firebase-functions/v2/https";

import {ensureAuth} from "../utils/auth";
import {
  buildPayload,
  assertPayloadForUid,
  decryptPassword,
  signPayload,
  verifyToken,
} from "../utils/crypto";
import {EncryptPayload, DecryptPayload} from "../types";

export const cryptoPassEncrypt = onCall<EncryptPayload, DecryptPayload>((request) => {
  const uid = ensureAuth(request);
  const secretHash = request.data?.secretHash ?? "";

  if (!secretHash) {
    throw new HttpsError("invalid-argument", "secretHash is required.");
  }

  const payload = buildPayload(uid, secretHash);
  const token = signPayload(payload);
  return {token};
});

export const cryptoPassDecrypt = onCall<DecryptPayload, EncryptPayload>((request) => {
  const uid = ensureAuth(request);
  const token = request.data?.token ?? "";

  if (!token) {
    throw new HttpsError("invalid-argument", "token is required.");
  }

  const payload = verifyToken(token);
  assertPayloadForUid(uid, payload);
  const secretHash = decryptPassword(uid, payload);
  return {secretHash};
});
