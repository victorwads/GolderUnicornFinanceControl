import assert from 'node:assert/strict';
import test from 'node:test';
import type {CallableRequest, Request as HttpsRequest} from 'firebase-functions/v2/https';

import {cryptoPassEncrypt, cryptoPassDecrypt} from './index';

type EncryptRequest = CallableRequest<{ secretHash: string }>;
type DecryptRequest = CallableRequest<{ token: string }>;

function buildEncryptRequest(uid: string, secretHash: string): EncryptRequest {
  return {
    data: {secretHash},
    auth: {uid, token: {} as any},
    rawRequest: {} as HttpsRequest,
    acceptsStreaming: false,
  } as EncryptRequest;
}

function buildDecryptRequest(uid: string, token: string): DecryptRequest {
  return {
    data: {token},
    auth: {uid, token: {} as any},
    rawRequest: {} as HttpsRequest,
    acceptsStreaming: false,
  } as DecryptRequest;
}

process.env.CRYPTO_JWT_SIGN_SECRET = 'test-sign-secret';
process.env.CRYPTO_JWT_ENCRYPT_SECRET = 'test-encrypt-secret';

const SECRET_VALUE = 'valor-x';

void test('cryptoPassDecrypt retorna o valor original para o mesmo usuário', async () => {
  const uid = 'user-123';

  const encryptResponse = await cryptoPassEncrypt.run(buildEncryptRequest(uid, SECRET_VALUE));
  const decryptResponse = await cryptoPassDecrypt.run(buildDecryptRequest(uid, encryptResponse.token));

  assert.equal(decryptResponse.secretHash, SECRET_VALUE);
});

void test('cryptoPassDecrypt rejeita quando o token é usado com outro usuário', async () => {
  const originalUid = 'user-123';
  const otherUid = 'user-456';

  const encryptResponse = await cryptoPassEncrypt.run(buildEncryptRequest(originalUid, SECRET_VALUE));

  await assert.rejects(
    () => cryptoPassDecrypt.run(buildDecryptRequest(otherUid, encryptResponse.token)),
  );
});
