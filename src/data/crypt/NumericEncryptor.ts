const MASK = 0b11n;
const MASK_SIZE = BigInt(MASK.toString(2).length - 1);
const FLOAT_PRECISION = 1000;
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const isFloat = (n: number) => n !== Math.floor(n);

type MaskDataType = bigint;
const MaskDataType = {
  INTEGER: 0n,
  FLOAT: 1n,
  BOOLEAN: 2n,
  DATE: 3n,
}

export default class NumericEncryptor {

  private offset: bigint;
  private multiplier: bigint;

  constructor(hash: string) {
    if(hash.length !== 64) throw new Error(`Invalid hash length: ${hash.length}. Expected 64 characters.`);
    this.offset = BigInt(parseInt(hash.slice(0, 8), 16) % 1_000_000);
    this.multiplier = BigInt((parseInt(hash.slice(8, 16), 16) % 100) + 1);
  }

  private flagNumber(value: number, flag: MaskDataType): bigint {
    return (BigInt(value) << MASK_SIZE) | flag;
  }

  private encode(value: number|Date|boolean): bigint {
    switch (typeof value) {
      case 'boolean':
        return this.flagNumber(value ? 1 : 0, MaskDataType.BOOLEAN);
      case 'number':
        return isFloat(value)
          ? this.flagNumber(Math.trunc(value * FLOAT_PRECISION), MaskDataType.FLOAT)
          : this.flagNumber(value, MaskDataType.INTEGER);
      case 'object': if (value instanceof Date)
        return this.flagNumber(value.getTime(), MaskDataType.DATE);
    }
    throw new Error(`Invalid number or type: ${value}`);
  }

  private decode(value: bigint): number|Date|boolean {
    const flag = value & MASK;
    const number = value >> MASK_SIZE;

    switch (flag) {
      case MaskDataType.INTEGER:
        return Number(number);
      case MaskDataType.FLOAT:
        return Number(number) / FLOAT_PRECISION;
      case MaskDataType.DATE:
        let date = new Date(Number(number)) as any;
        date.toDate = () => date;
        return date;
      case MaskDataType.BOOLEAN:
        return number === 1n;
      default:
        throw new Error(`Invalid flag: ${flag.toString(2)}`);
    }
  }

  public encrypt(value: number|Date|boolean): number {
    const encodedValue = this.encode(value);
    const encrypted = (encodedValue + this.offset) * this.multiplier;
    if (encrypted > MAX_SAFE_INTEGER) {
      throw new Error(`Encrypted value exceeds safe integer limit: ${encrypted}`);
    }
    return Number(encrypted);
  }

  public decrypt(flaggedEncryptedNumber: bigint): number|Date|boolean {
    const encodedValue = (flaggedEncryptedNumber / this.multiplier) - this.offset;
    return this.decode(encodedValue);
  }
}
