export type MonthNumber = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
export type MonthKey = `${number}-${
  | "01"
  | "02"
  | "03"
  | "04"
  | "05"
  | "06"
  | "07"
  | "08"
  | "09"
  | "10"
  | "11"
  | "12"}`;

export type Period = {
  start: Date;
  end: Date;
  displayMonth: Month;
};

const CUTOFF_MAX_DAY = 28;

export default class FinancialMonthPeriod {
  constructor(
    private readonly cutOffDay: number = 1,
    private displayType: "start" | "next" = "start"
  ) {
    if (cutOffDay < 1 || cutOffDay > CUTOFF_MAX_DAY) {
      throw new Error(`Cut-off day must be between 1 and ${CUTOFF_MAX_DAY}.`);
    }
    this.cutOffDay = cutOffDay;
  }

  public getMonthPeriod(month: Month): Period {
    const { year, month: m } = month;
    let startMounth = this.displayType === "start" ? m - 1 : m - 2;

    const start = new Date(year, startMounth, this.cutOffDay);
    const end = new Date(year, startMounth + 1, this.cutOffDay, 0, 0, 0, 0);
    end.setMilliseconds(end.getMilliseconds() - 1);

    return {
      start,
      end,
      displayMonth: month,
    };
  }

  public getMonthForDate(date: Date): Month {
    const day = date.getDate();
    let month: MonthNumber, year: number;
    if (this.displayType === "start") {
      month = (
        day >= this.cutOffDay ? date.getMonth() + 1 : date.getMonth()
      ) as MonthNumber;
    } else {
      month = (
        day >= this.cutOffDay ? date.getMonth() + 2 : date.getMonth() + 1
      ) as MonthNumber;
    }
    year = date.getFullYear();
    if (month > 12) {
      month = 1;
      year++;
    } else if (month < 1) {
      month = 12;
      year--;
    }
    return new Month(year, month);
  }

  public getPeriodForDate(date: Date): Period {
    return this.getMonthPeriod(this.getMonthForDate(date));
  }
}

export class Month {
  public readonly key: MonthKey;

  constructor(
    public readonly year: number,
    public readonly month: MonthNumber
  ) {
    this.key = this.toKey();
  }

  private toKey(): MonthKey {
    return `${this.year}-${this.month.toString().padStart(2, "0")}` as MonthKey;
  }

  static fromKey(ym: MonthKey): Month {
    const [yStr, mStr] = ym.split("-");
    return new Month(parseInt(yStr), parseInt(mStr) as MonthNumber);
  }

  static fromDate(date: Date): Month {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1) as MonthNumber;
    return new Month(year, month);
  }

  public get localeName(): string {
    return new Date(this.year, this.month - 1).toLocaleDateString(navigator.language, { month: 'long', year: 'numeric' })
  }

  plusOneMonth(): Month {
    let { year, month } = this;
    month++;
    if (month > 12) {
      year++;
      month = 1;
    }
    return new Month(year, month as MonthNumber);
  }

  minusOneMonth(): Month {
    let { year, month } = this;
    month--;
    if (month < 1) {
      year--;
      month = 12;
    }
    return new Month(year, month as MonthNumber);
  }
}
