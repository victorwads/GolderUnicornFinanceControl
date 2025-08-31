package br.com.victorwads.goldenunicorn.data.services

import java.util.Calendar
import java.util.Date

class FinancialMonthPeriod(private val cutOff: Int = 1) {
    data class Month(val year: Int, val month: Int) { // month: 1..12
        val key: String get() = String.format("%04d-%02d", year, month)
    }

    data class Period(val start: Date, val end: Date)

    fun getMonthForDate(date: Date = Date()): Month {
        val cal = Calendar.getInstance().apply { time = date }
        val d = cal.get(Calendar.DAY_OF_MONTH)
        val y = cal.get(Calendar.YEAR)
        val m = cal.get(Calendar.MONTH) + 1
        return if (d >= cutOff) Month(y, m) else prevMonth(Month(y, m))
    }

    fun getMonthPeriod(month: Month): Period {
        val start = Calendar.getInstance().apply {
            set(Calendar.YEAR, month.year)
            set(Calendar.MONTH, month.month - 1)
            set(Calendar.DAY_OF_MONTH, cutOff)
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
        val end = (start.clone() as Calendar).apply {
            add(Calendar.MONTH, 1)
            add(Calendar.MILLISECOND, -1)
        }
        return Period(start.time, end.time)
    }

    fun prevMonth(month: Month): Month {
        return if (month.month == 1) Month(month.year - 1, 12) else Month(month.year, month.month - 1)
    }
}

