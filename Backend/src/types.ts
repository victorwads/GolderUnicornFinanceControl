export type EncryptPayload = { secretHash: string };
export type DecryptPayload = { token: string };

export type JwtPayload = {
  c: string;
  i: string;
  t: string;
  v: number;
  iat: number;
};