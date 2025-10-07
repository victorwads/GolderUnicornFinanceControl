export interface ParsedOfxTransaction {
  fitId?: string;
  date: Date;
  amount: number;
  description: string;
  memo?: string;
  raw: Record<string, string>;
}

export function parseOfx(content: string): ParsedOfxTransaction[] {
  const sanitized = (content || "").replace(/\r/g, "");
  const lines = sanitized.split(/\n/);
  const transactions: ParsedOfxTransaction[] = [];

  let current: Record<string, string> | null = null;
  let lastTag: string | null = null;

  const pushCurrent = () => {
    if (!current) return;

    const amountRaw = current.TRNAMT ?? current.AMOUNT;
    const dateRaw =
      current.DTPOSTED ??
      current.DTUSER ??
      current.DTAVAIL ??
      current.DTSTART ??
      current.DTEND;

    if (!amountRaw || !dateRaw) {
      current = null;
      lastTag = null;
      return;
    }

    const date = parseOfxDate(dateRaw);
    if (!date) {
      current = null;
      lastTag = null;
      return;
    }

    const amount = parseOfxAmount(amountRaw);
    if (!Number.isFinite(amount) || amount === 0) {
      current = null;
      lastTag = null;
      return;
    }

    const description = buildDescription(current);
    const fitId = current.FITID || current.TRNUID || current.REFNUM;

    transactions.push({
      fitId,
      date,
      amount,
      description,
      memo: current.MEMO || current.NAME || current.PAYEE,
      raw: current,
    });

    current = null;
    lastTag = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") continue;

    if (line.startsWith("<")) {
      const match = line.match(/^<([^>]+)>(.*)$/);
      if (!match) continue;

      const tag = match[1].trim();
      const value = (match[2] || "").trim();
      const normalizedTag = normalizeTagName(tag);

      if (normalizedTag === "STMTTRN" || normalizedTag === "CCSTMTTRN") {
        if (current) pushCurrent();
        current = {};
        lastTag = null;
        continue;
      }

      if (normalizedTag === "/STMTTRN" || normalizedTag === "/CCSTMTTRN") {
        pushCurrent();
        continue;
      }

      if (!current) {
        lastTag = null;
        continue;
      }

      if (normalizedTag) {
        current[normalizedTag] = value;
        lastTag = normalizedTag;
      }
    } else if (current && lastTag) {
      current[lastTag] = `${current[lastTag]} ${line}`.trim();
    }
  }

  if (current) pushCurrent();

  return transactions.sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
}

function normalizeTagName(tag: string): string {
  return tag.toUpperCase().replace(/[^A-Z0-9/]/g, "");
}

function parseOfxAmount(value: string): number {
  const compact = value.replace(/\s/g, "");
  const hasComma = compact.includes(",");
  const hasDot = compact.includes(".");

  let sanitized = compact;
  if (hasComma && hasDot) {
    // Assume comma is thousand separator in this scenario
    sanitized = sanitized.replace(/,/g, "");
  } else if (hasComma) {
    sanitized = sanitized.replace(/,/g, ".");
  }

  return parseFloat(sanitized);
}

function parseOfxDate(value: string): Date | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 8) return null;

  const year = Number(digits.slice(0, 4));
  const month = Number(digits.slice(4, 6)) - 1;
  const day = Number(digits.slice(6, 8));
  const hour = digits.length >= 10 ? Number(digits.slice(8, 10)) : 0;
  const minute = digits.length >= 12 ? Number(digits.slice(10, 12)) : 0;
  const second = digits.length >= 14 ? Number(digits.slice(12, 14)) : 0;

  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day) ||
    month < 0 ||
    month > 11 ||
    day < 1 ||
    day > 31
  ) {
    return null;
  }

  return new Date(year, month, day, hour, minute, second);
}

function buildDescription(raw: Record<string, string>): string {
  const description =
    raw.MEMO ||
    raw.NAME ||
    raw.PAYEE ||
    raw.CHECKNUM ||
    raw.TRNTYPE ||
    raw.FITID ||
    "OFX";
  return description.trim();
}
