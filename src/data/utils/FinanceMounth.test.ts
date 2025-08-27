import { Month } from "./FinancialMonthPeriod";

describe('helpers', () => {
  test('fromDate', () => {
    const date = new Date(2025, 0, 15, 10, 30, 45, 123);
    const ym = Month.fromDate(date);
    expect(ym).toEqual({ year: 2025, month: 1, key: "2025-01" });
  });
  test('fromKey', () => {
    const key = "2025-01";
    const ym = Month.fromKey(key);
    expect(ym).toEqual({ year: 2025, month: 1, key: "2025-01" });
  });
  test('withConstructor', () => {
    const ym = new Month(2025, 1);
    expect(ym).toEqual({ year: 2025, month: 1, key: "2025-01" });
  });
});