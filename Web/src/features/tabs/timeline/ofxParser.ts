import { XMLParser } from "fast-xml-parser";

export interface ParsedOfxTransaction {
  fitId?: string;
  date: Date;
  amount: number;
  description: string;
  memo?: string;
  raw: Record<string, string>;
}

const TRANSACTION_TAGS = new Set(["STMTTRN", "CCSTMTTRN"]);

export function parseOfx(content: string): ParsedOfxTransaction[] {
  const xml = convertOfxToXml(content);
  const parser = new XMLParser({
    ignoreAttributes: true,
    allowBooleanAttributes: true,
    trimValues: true,
    transformTagName: (tag) => tag.toUpperCase(),
  });

  const parsed = parser.parse(xml);
  const rawTransactions = extractTransactions(parsed);

  return rawTransactions
    .map((raw) => toParsedTransaction(raw))
    .filter((item): item is ParsedOfxTransaction => Boolean(item))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}

function convertOfxToXml(content: string): string {
  if (!content) {
    throw new Error("Empty OFX payload");
  }

  const startIndex = content.indexOf("<OFX");
  if (startIndex === -1) {
    throw new Error("Invalid OFX format: missing <OFX> root element");
  }

  const lines = content
    .slice(startIndex)
    .replace(/\r/g, "\n")
    .split("\n");

  const normalizedLines: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (line === "") continue;

    if (line.startsWith("<")) {
      normalizedLines.push(line);
      continue;
    }

    if (normalizedLines.length === 0) continue;

    const lastIndex = normalizedLines.length - 1;
    normalizedLines[lastIndex] = `${normalizedLines[lastIndex]} ${line}`;
  }

  const normalizedSgml = normalizedLines.join("\n");
  const escaped = escapeBareEntities(normalizedSgml);

  return escaped.replace(
    /<([A-Za-z0-9_]+)>([^<\n\r]+)/g,
    (match, tag, value, offset, full) => {
      const rest = full.slice(offset + match.length);
      const normalizedTag = tag.trim();
      const trimmedValue = value.trim();

      if (trimmedValue === "") {
        return `<${normalizedTag}></${normalizedTag}>`;
      }

      const closingRegex = new RegExp(`^\\s*</${normalizedTag}>`, "i");
      const escapedValue = escapeXmlText(trimmedValue);

      if (closingRegex.test(rest)) {
        return `<${normalizedTag}>${escapedValue}`;
      }

      return `<${normalizedTag}>${escapedValue}</${normalizedTag}>`;
    }
  );
}

function escapeBareEntities(value: string): string {
  return value.replace(
    /&(?![a-zA-Z]+;|#[0-9]+;)/g,
    "&amp;"
  );
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&(?!(?:amp|lt|gt|quot|apos);)/gi, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function extractTransactions(root: unknown): Record<string, string>[] {
  const result: Record<string, string>[] = [];

  const visit = (node: unknown) => {
    if (!node) return;

    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }

    if (typeof node !== "object") {
      return;
    }

    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      const normalizedKey = key.toUpperCase();

      if (TRANSACTION_TAGS.has(normalizedKey)) {
        const items = Array.isArray(value) ? value : [value];
        for (const item of items) {
          if (!item || typeof item !== "object") continue;
          result.push(normalizeTransactionRecord(item as Record<string, unknown>));
        }
        continue;
      }

      visit(value);
    }
  };

  visit(root);
  return result;
}

function normalizeTransactionRecord(entry: Record<string, unknown>): Record<string, string> {
  const normalized: Record<string, string> = {};

  for (const [key, value] of Object.entries(entry)) {
    const normalizedKey = key.toUpperCase();
    const text = extractText(value);
    if (text !== "") {
      normalized[normalizedKey] = text;
    }
  }

  return normalized;
}

function extractText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    return value.map(extractText).filter(Boolean).join(" ").trim();
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(extractText)
      .filter(Boolean)
      .join(" ")
      .trim();
  }
  return "";
}

function toParsedTransaction(raw: Record<string, string>): ParsedOfxTransaction | null {
  const amountRaw = raw.TRNAMT ?? raw.AMOUNT;
  const dateRaw =
    raw.DTPOSTED ??
    raw.DTUSER ??
    raw.DTAVAIL ??
    raw.DTSTART ??
    raw.DTEND;

  if (!amountRaw || !dateRaw) {
    return null;
  }

  const date = parseOfxDate(dateRaw);
  if (!date) return null;

  const amount = parseOfxAmount(amountRaw);
  if (!Number.isFinite(amount) || amount === 0) return null;

  const description = buildDescription(raw);
  const fitId = raw.FITID || raw.TRNUID || raw.REFNUM;

  return {
    fitId,
    date,
    amount,
    description,
    memo: raw.MEMO || raw.NAME || raw.PAYEE,
    raw,
  };
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
