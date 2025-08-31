package br.com.victorwads.goldenunicorn

import br.com.victorwads.goldenunicorn.data.repositories.TimelineRepository
import br.com.victorwads.goldenunicorn.data.repositories.TimelineRepository.Companion.calculateFinancialMonthInterval
import br.com.victorwads.goldenunicorn.data.repositories.TimelineRepository.Companion.getCurrentFinancialMonth
import org.junit.Assert.assertEquals
import org.junit.Assert.assertThrows
import org.junit.Test
import java.text.DateFormatSymbols
import java.util.Calendar

class TimelineRepositoryTest {

    @Test
    fun `test calculateFinancialMonthInterval - early month`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.JANUARY, 5) }.time
        val startDay = 10
        val expectedStartDate = Calendar.getInstance().apply {
            set(2023, Calendar.JANUARY, 10, 0, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }.time
        val expectedEndDate = Calendar.getInstance().apply {
            set(2023, Calendar.FEBRUARY, 9, 23, 59, 59)
            set(Calendar.MILLISECOND, 999)
        }.time

        val (startDate, endDate) = calculateFinancialMonthInterval(date, startDay)
        assertEquals(expectedStartDate, startDate)
        assertEquals(expectedEndDate, endDate)
    }

    @Test
    fun `test calculateFinancialMonthInterval - mid month`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.MAY, 15) }.time
        val startDay = 15
        val expectedStartDate = Calendar.getInstance().apply {
            set(2023, Calendar.MAY, 15, 0, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }.time
        val expectedEndDate = Calendar.getInstance().apply {
            set(2023, Calendar.JUNE, 14, 23, 59, 59)
            set(Calendar.MILLISECOND, 999)
        }.time

        val (startDate, endDate) = calculateFinancialMonthInterval(date, startDay)
        assertEquals(expectedStartDate, startDate)
        assertEquals(expectedEndDate, endDate)
    }

    @Test
    fun `test calculateFinancialMonthInterval - end month`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.AUGUST, 31) }.time
        val startDay = 1
        val expectedStartDate = Calendar.getInstance().apply {
            set(2023, Calendar.AUGUST, 1, 0, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }.time
        val expectedEndDate = Calendar.getInstance().apply {
            set(2023, Calendar.AUGUST, 31, 23, 59, 59)
            set(Calendar.MILLISECOND, 999)
        }.time

        val (startDate, endDate) = calculateFinancialMonthInterval(date, startDay)
        assertEquals(expectedStartDate, startDate)
        assertEquals(expectedEndDate, endDate)
    }

    @Test
    fun `test calculateFinancialMonthInterval - financial day 20 or higher`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.SEPTEMBER, 20) }.time
        val startDay = 20
        val expectedStartDate = Calendar.getInstance().apply {
            set(2023, Calendar.AUGUST, 20, 0, 0, 0)
            set(Calendar.MILLISECOND, 0)
        }.time
        val expectedEndDate = Calendar.getInstance().apply {
            set(2023, Calendar.SEPTEMBER, 19, 23, 59, 59)
            set(Calendar.MILLISECOND, 999)
        }.time

        val (startDate, endDate) = calculateFinancialMonthInterval(date, startDay)
        assertEquals(expectedStartDate, startDate)
        assertEquals(expectedEndDate, endDate)
    }

    @Test
    fun `test getCurrentFinancialMonth - day before financial day`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.NOVEMBER, 19) }.time
        val financialDay = 20
        val expectedMonthName = DateFormatSymbols().months[Calendar.NOVEMBER]

        val monthName = getCurrentFinancialMonth(date, financialDay)
        assertEquals(expectedMonthName, monthName)
    }

    @Test
    fun `test getCurrentFinancialMonth - day on or after financial day`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.DECEMBER, 20) }.time
        val financialDay = 20
        val expectedMonthName = DateFormatSymbols().months[Calendar.JANUARY]

        val monthName = getCurrentFinancialMonth(date, financialDay)
        assertEquals(expectedMonthName, monthName)
    }

    @Test
    fun `test calculateFinancialMonthInterval with invalid start day`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.MARCH, 15) }.time
        val invalidStartDay = 28

        assertThrows(IllegalArgumentException::class.java) {
            calculateFinancialMonthInterval(date, invalidStartDay)
        }
    }

    @Test
    fun `test getCurrentFinancialMonth with invalid financial day`() {
        val date = Calendar.getInstance().apply { set(2023, Calendar.MARCH, 15) }.time
        val invalidFinancialDay = 28

        assertThrows(IllegalArgumentException::class.java) {
            getCurrentFinancialMonth(date, invalidFinancialDay)
        }
    }
}