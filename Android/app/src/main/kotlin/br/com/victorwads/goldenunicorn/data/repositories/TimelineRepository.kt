package br.com.victorwads.goldenunicorn.data.repositories

import java.text.DateFormatSymbols
import java.util.Calendar
import java.util.Date

internal class TimelineRepository(
    private val accountsRepository: AccountsRepository,
) {
    suspend fun getTimeline() {
        val accounts = accountsRepository.getAll()
        // get from firebase
    }
}

fun calculateFinancialMonthInterval(date: Date, startDay: Int): Pair<Date, Date> {
    require(startDay in 1..27) { "Start day must be between 1 and 27" }

    val calendar = Calendar.getInstance().apply {
        time = date
        set(get(Calendar.YEAR), get(Calendar.MONTH), startDay, 0, 0, 0)
        set(Calendar.MILLISECOND, 0)
        if (startDay >= 20) add(Calendar.MONTH, -1)
    }
    val startDate = calendar.time
    val endDate = calendar.apply {
        add(Calendar.MONTH, 1)
        add(Calendar.DAY_OF_MONTH, -1)
        set(Calendar.HOUR_OF_DAY, 23)
        set(Calendar.MINUTE, 59)
        set(Calendar.SECOND, 59)
        set(Calendar.MILLISECOND, 999)
    }.time

    return Pair(startDate, endDate)
}

fun getCurrentFinancialMonth(date: Date, financialDay: Int): String {
    require(financialDay in 1..27) { "Financial day must be between 1 and 27" }

    val calendar = Calendar.getInstance().apply {
        time = date
        if (get(Calendar.DAY_OF_MONTH) >= financialDay && financialDay >= 20) {
            add(Calendar.MONTH, 1)
        }
    }

    return DateFormatSymbols().months[calendar.get(Calendar.MONTH)]
}

fun main() {
    val testDates = arrayOf(
        Calendar.getInstance().apply { set(2023, Calendar.JANUARY, 3) }.time,
        Calendar.getInstance().apply { set(2023, Calendar.FEBRUARY, 15) }.time,
        Calendar.getInstance().apply { set(2023, Calendar.FEBRUARY, 19) }.time,
        Calendar.getInstance().apply { set(2023, Calendar.JUNE, 23) }.time,
        Calendar.getInstance().apply { set(2023, Calendar.DECEMBER, 12) }.time
    )
    val startDays = arrayOf(7, 19, 20, 25, 1)

    for (date in testDates) {
        for (startDay in startDays) {
            val (startDate, endDate) = calculateFinancialMonthInterval(date, startDay)
            println("Date: ${date}, Start Day: $startDay -> Start Date: $startDate, End Date: $endDate")
            println("Name: ${getCurrentFinancialMonth(date, startDay)}")
            println()
        }
    }
}
