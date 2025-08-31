package br.com.victorwads.goldenunicorn.features

sealed class Screens(val route: String, val deepLink: String) {
    data object Login : Screens("login", "goldenunicorn://login")
    sealed class Main(route: String, deepLink: String) :
        Screens("main/$route", "goldenunicorn://main/$deepLink") {
        data object DashBoard : Main("dashboard", "dashboard")
        data object Timeline : Main("timeline", "timeline")
        data object Settings : Main("settings", "settings")
    }

    data object Accounts : Screens("accounts", "goldenunicorn://accounts")
    data object CreditCards : Screens("creditcards", "goldenunicorn://creditcards")
    data object Categories : Screens("categories", "goldenunicorn://categories")
}
