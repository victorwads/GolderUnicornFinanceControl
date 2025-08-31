import Foundation

enum Collections {
    // Canonical keys
    static let banks = "Banks"
    static let users = "Users"
    static let categories = "Categories"
    static let accounts = "Accounts"
    static let accountsRegistries = "AccountsRegistries"
    static let accountsMonthCache = "MonthCache"
    static let creditCards = "CreditCards"
    static let creditCardRegistries = "CreditCardRegistries"
    static let creditCardInvoices = "CreditCardInvoices"
    static let registers = "Registers"
    static let products = "GroceriesProducts"
    static let groceries = "GroceriesItems"
    static let resourcesUse = "ResourcesUse"

    // Backwards-compatibility aliases (previously capitalized names)
    static let Banks = banks
    static let Users = users
    static let Categories = categories
    static let Accounts = accounts
    static let AccountsRegistries = accountsRegistries
    static let CreditCards = creditCards
    static let CreditCardRegistries = creditCardRegistries
    static let CreditCardInvoices = creditCardInvoices
}
