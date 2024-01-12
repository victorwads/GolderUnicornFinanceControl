package br.com.victorwads.goldenunicorn.features

sealed class Screens(val route: String) {
    data object Login : Screens("login")
    sealed class Main(route: String) : Screens("main/$route") {
        data object DashBoard : Main("dashboard")
        data object Timeline : Main("timeline")
        data object Settings : Main("settings")
    }
    data object Accounts : Screens("accounts")
    data object CreditCards : Screens("creditcards")
}
