const MASK = 0b11n;
const MASK_SIZE = BigInt(MASK.toString(2).length);
const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);
const FLOAT_PRECISION = 1000;

const MAX_MULTIPLIER = (2**4); // 4 bits for multiplier
const MAX_OFFSET = (2**16); // 16 bits for offset

const BOOLEAN_MASK = 0b1n;
const BOOLEAN_INDEXER_SHIFT = 32n; // 32 bits for boolean places,
const BOOLEAN_INDEXER_SIZE = 0b11111n; // 5 bits for boolean index, 0-31
const BOOLEAN_MAX_NOISE = parseInt('1'.repeat(Number(BOOLEAN_INDEXER_SHIFT)), 2);

type MaskDataType = bigint;
const MaskDataType = {
  INTEGER: 0n,
  FLOAT: 1n,
  BOOLEAN: 2n,
  DATE: 3n,
}

export default class NumericEncryptor {

  public static readonly MAX_SAFE_INTEGER = Number(
    BigInt(
      Math.trunc((Number.MAX_SAFE_INTEGER - MAX_OFFSET) / MAX_MULTIPLIER)
    ) << MASK_SIZE
  );

  private offset: bigint;
  private booleanOffset: bigint;
  private multiplier: bigint;

  constructor(hash: string) {
    if(hash.length !== 64) throw new Error(`Invalid hash length: ${hash.length}. Expected 64 characters.`);
    this.offset = BigInt(parseInt(hash.slice(0, 16), 16) % MAX_OFFSET);
    this.multiplier = BigInt((parseInt(hash.slice(16, 32), 16) % MAX_MULTIPLIER) + 1);
    this.booleanOffset = this.offset;
  }

  public encrypt(value: number|Date|boolean): number {
    const encodedValue = this.encode(value);
    const encrypted = (encodedValue * this.multiplier) + this.offset;
    if (encrypted > MAX_SAFE_INTEGER) {
      throw new Error(`Encrypted value exceeds safe integer limit: ${encrypted}`);
    }
    return Number(encrypted);
  }

  public decrypt(flaggedEncryptedNumber: number): number|Date|boolean {
    const encodedValue = (BigInt(flaggedEncryptedNumber) - this.offset) / this.multiplier;
    return this.decode(encodedValue);
  }

  private encode(value: number|Date|boolean): bigint {
    switch (typeof value) {
      case 'boolean':
        return this.flagNumber(this.createRamdomBoolean(value), MaskDataType.BOOLEAN);
      case 'number':
        return Number.isInteger(value)
          ? this.flagNumber(value, MaskDataType.INTEGER)
          : this.flagNumber(Math.trunc(value * FLOAT_PRECISION), MaskDataType.FLOAT);
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
        return new Date(Number(number));
      case MaskDataType.BOOLEAN:
        return this.decodeRandomBoolean(number);
      default:
        throw new Error(`Invalid flag: ${flag.toString(2)}`);
    }
  }

  private flagNumber(value: number|bigint, flag: MaskDataType): bigint {
    return (BigInt(value) << MASK_SIZE) | flag;
  }

  private createRamdomBoolean(value: boolean): bigint {
    const noise = BigInt(Math.floor(Math.random() * BOOLEAN_MAX_NOISE));
    const booleanPosition = this.booleanOffset++ % BOOLEAN_INDEXER_SIZE;

    let noiseWithValue = value
      ? noise | (1n << booleanPosition) // set bit
      : noise & ~(1n << booleanPosition); // clear bit

    return (booleanPosition << 32n) | noiseWithValue;
  }

  private decodeRandomBoolean(value: bigint): boolean {
    const booleanIndex = value >> BOOLEAN_INDEXER_SHIFT;
    const booleanValue = (value >> booleanIndex) & BOOLEAN_MASK;
    return booleanValue === 1n;
  }
}
