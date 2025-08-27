import { describe, test } from 'vitest';
import FinancialMonthPeriod, { Month, MonthNumber } from './FinancialMonthPeriod';
import { Period } from './FinancialMonthPeriod';

describe('cutOffDay=1', () => {
  const fmp = new FinancialMonthPeriod();

  test('getMonthPeriod 28days month', () => {
    const month = new Month(2025, 2);
    const period = fmp.getMonthPeriod(month);

    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,2, 1));
    expect(period.end).toEqual(lastSecondDate(2025,2, 28));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 29days month', () => {
    const month = new Month(2024, 2);
    const period = fmp.getMonthPeriod(month);
    
    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2024,2, 1));
    expect(period.end).toEqual(lastSecondDate(2024,2, 29));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 30days month', () => {
    const month = new Month(2025, 4);
    const period = fmp.getMonthPeriod(month);

    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,4, 1));
    expect(period.end).toEqual(lastSecondDate(2025,4, 30));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 31days month', () => {
    const month = new Month(2025, 3);
    const period = fmp.getMonthPeriod(month);
    
    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,3, 1));
    expect(period.end).toEqual(lastSecondDate(2025,3, 31));
    validadePeriodForDate(fmp, period, month);
  });

  test('getPeriodForDate middle', () => {
    const date = new Date(2025, 1, 15);
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 2));
  });

  test('getPeriodForDate init', () => {
    const date = new Date(2025, 1, 1); // February
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 2));
  });

  test('getPeriodForDate end', () => {
    const date = new Date(2024, 1, 29); // February
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2024, 2));
  });

    test('getPeriodForDate end', () => {
    const date = new Date(2024, 2, 1); // March
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2024, 3));
  });

  test('getPeriodForDate next', () => {
    const date = new Date(2025, 2, 1); // March
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 3));
  });
});

describe('cutOffDay=14', () => {
  const fmp = new FinancialMonthPeriod(14, "start");

  test('getMonthPeriod 28days month', () => {
    const month = new Month(2025, 2);
    const period = fmp.getMonthPeriod(month);

    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,2, 14));
    expect(period.end).toEqual(lastSecondDate(2025,3, 13));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 29days month', () => {
    const month = new Month(2024, 2);
    const period = fmp.getMonthPeriod(month);
    
    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2024,2, 14));
    expect(period.end).toEqual(lastSecondDate(2024,3, 13));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 30days month', () => {
    const month = new Month(2025, 4);
    const period = fmp.getMonthPeriod(month);

    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,4, 14));
    expect(period.end).toEqual(lastSecondDate(2025,5, 13));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 31days month', () => {
    const month = new Month(2025, 3);
    const period = fmp.getMonthPeriod(month);
    
    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,3, 14));
    expect(period.end).toEqual(lastSecondDate(2025,4, 13));
    validadePeriodForDate(fmp, period, month);
  });

  test('start year', () => {
    const date = new Date(2025, 0, 1); // January
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2024, 12));
  });
  test('end year', () => {
    const date = new Date(2025, 11, 31); // December
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 12));
  });

  test('getPeriodForDate middle', () => {
    const date = new Date(2025, 1, 15);
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 2));
  });

  test('getPeriodForDate init', () => {
    const date = new Date(2025, 1, 1); // February
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 1));
  });

  test('getPeriodForDate end', () => {
    const date = new Date(2024, 1, 29); // February
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2024, 2));
  });

    test('getPeriodForDate end', () => {
    const date = new Date(2024, 2, 1); // March
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2024, 2));
  });

  test('getPeriodForDate next', () => {
    const date = new Date(2025, 2, 1); // March
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 2));
  });
});

describe('cutOffDay=27', () => {
  const fmp = new FinancialMonthPeriod(27, 'next');

  test('getMonthPeriod 28days month', () => {
    const month = new Month(2025, 2);
    const period = fmp.getMonthPeriod(month);

    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,1, 27));
    expect(period.end).toEqual(lastSecondDate(2025,2, 26));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 29days month', () => {
    const month = new Month(2024, 2);
    const period = fmp.getMonthPeriod(month);
    
    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2024,1, 27));
    expect(period.end).toEqual(lastSecondDate(2024,2, 26));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 30days month', () => {
    const month = new Month(2025, 4);
    const period = fmp.getMonthPeriod(month);

    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,3, 27));
    expect(period.end).toEqual(lastSecondDate(2025,4, 26));
    validadePeriodForDate(fmp, period, month);
  });
  test('getMonthPeriod 31days month', () => {
    const month = new Month(2025, 3);
    const period = fmp.getMonthPeriod(month);
    
    expect(period.displayMonth).toEqual(month);
    expect(period.start).toEqual(firstSecondDate(2025,2, 27));
    expect(period.end).toEqual(lastSecondDate(2025,3, 26));
    validadePeriodForDate(fmp, period, month);
  });

  test('start year', () => {
    const date = new Date(2025, 0, 1); // January
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2025, 1));
  });
  test('end year', () => {
    const date = new Date(2025, 11, 31); // December
    const month = fmp.getMonthForDate(date);
    expect(month).toEqual(new Month(2026, 1));
  });
});

function firstSecondDate(year: number, month: number, day: number): Date {
  const firstSecond = new Date(year, month - 1, day);
  return firstSecond;
}

function lastSecondDate(year: number, month: number, day: number): Date {
  const lastSecond = firstSecondDate(year, month, day + 1);
  return new Date(lastSecond.getTime() - 1);
}

function validadePeriodForDate(fmp: FinancialMonthPeriod, period: Period, month: Month) {
    let currentDay = period.start
    while (currentDay <= period.end) {
        expect(fmp.getMonthForDate(currentDay)).toEqual(month);
        currentDay.setDate(currentDay.getDate() + 1);
    }
}
