package br.com.victorwads.goldenunicorn.data.services

class BalanceService(
    private val timeline: TimelineService
) {
    suspend fun getBalance(): Double {
        return timeline.getAccountItems().sumOf { 0.0 }
    }
}
