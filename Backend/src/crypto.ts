import { HttpsError } from "firebase-functions/v2/https";
import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
} from "crypto";
import { JwtPayload } from "./types";

const JWT_ALG = "HS256";
const JWT_TYP = "JWT";
const PAYLOAD_VERSION = 1;

function getSignSecret(): string {
  const secret = process.env.CRYPTO_JWT_SIGN_SECRET;
  if (!secret) {
    throw new Error("CRYPTO_JWT_SIGN_SECRET not set.");
  }
  return secret;
}

function getEncryptSecret(): string {
  const secret = process.env.CRYPTO_JWT_ENCRYPT_SECRET;
  if (!secret) {
    throw new Error("CRYPTO_JWT_ENCRYPT_SECRET not set.");
  }
  return secret;
}

function base64UrlEncode(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(input: string): Buffer {
  const normalized = input
    .replace(/-/g, "+")
    .replace(/_/g, "/")
    .padEnd(Math.ceil(input.length / 4) * 4, "=");
  return Buffer.from(normalized, "base64");
}

function signPayload(payload: JwtPayload): string {
  const header = {alg: JWT_ALG, typ: JWT_TYP};
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const signature = createHmac("sha256", getSignSecret())
    .update(unsignedToken)
    .digest();
  const encodedSignature = base64UrlEncode(signature);
  return `${unsignedToken}.${encodedSignature}`;
}

function verifyToken(token: string): JwtPayload {
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new HttpsError("invalid-argument", "JWT inválido.");
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;
  const expectedSignature = base64UrlEncode(
    createHmac("sha256", getSignSecret())
      .update(unsignedToken)
      .digest(),
  );

  if (expectedSignature !== encodedSignature) {
    throw new HttpsError("permission-denied", "Assinatura inválida.");
  }

  let payload: JwtPayload;
  try {
    payload = JSON.parse(base64UrlDecode(encodedPayload).toString());
  } catch (error) {
    throw new HttpsError("invalid-argument", "Payload inválido.");
  }

  if (
    !payload ||
    typeof payload !== "object" ||
    typeof payload.c !== "string" ||
    typeof payload.i !== "string" ||
    typeof payload.t !== "string" ||
    typeof payload.v !== "number"
  ) {
    throw new HttpsError("invalid-argument", "Payload do JWT incompleto.");
  }

  return payload;
}

function deriveEncryptionKey(uid: string): Buffer {
  return createHash("sha256")
    .update(`${getEncryptSecret()}:${uid}`)
    .digest();
}

function encryptPassword(uid: string, password: string): {cipher: string; iv: string; tag: string} {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", deriveEncryptionKey(uid), iv);
  const encrypted = Buffer.concat([cipher.update(password, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    cipher: base64UrlEncode(encrypted),
    iv: base64UrlEncode(iv),
    tag: base64UrlEncode(authTag),
  };
}

function decryptPassword(uid: string, payload: JwtPayload): string {
  const iv = base64UrlDecode(payload.i);
  const encrypted = base64UrlDecode(payload.c);
  const authTag = base64UrlDecode(payload.t);
  const decipher = createDecipheriv("aes-256-gcm", deriveEncryptionKey(uid), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString("utf8");
}

function buildPayload(uid: string, password: string): JwtPayload {
  const encrypted = encryptPassword(uid, password);
  return {
    c: encrypted.cipher,
    i: encrypted.iv,
    t: encrypted.tag,
    v: PAYLOAD_VERSION,
    iat: Date.now(),
  };
}

function assertPayloadForUid(uid: string, payload: JwtPayload): void {
  if (payload.v !== PAYLOAD_VERSION) {
    throw new HttpsError("failed-precondition", "invalid token");
  }

  const iv = base64UrlDecode(payload.i);
  if (iv.length !== 12) {
    throw new HttpsError("invalid-argument", "invalid token");
  }
}

export { signPayload, verifyToken, buildPayload, assertPayloadForUid, decryptPassword };