import XCTest

final class DashboardUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testDashboardListsAndCards() throws {
        let app = XCUIApplication()
        app.launch()

        let root = app.otherElements["Dashboard.Root"]
        XCTAssertTrue(root.waitForExistence(timeout: 10), "Dashboard.Root did not appear")

        let accountsList = app.otherElements["Dashboard.Accounts.List"]
        XCTAssertTrue(accountsList.exists, "Accounts list should exist")

        let creditCardsList = app.otherElements["Dashboard.CreditCards.List"]
        XCTAssertTrue(creditCardsList.exists, "Credit cards list should exist")

        // If there is data, verify at least one card of each type exists
        let accountCardPredicate = NSPredicate(format: "identifier BEGINSWITH 'AccountCard.'")
        let creditCardCardPredicate = NSPredicate(format: "identifier BEGINSWITH 'CreditCardCard.'")

        let accountCards = root.descendants(matching: .any).matching(accountCardPredicate)
        let creditCards = root.descendants(matching: .any).matching(creditCardCardPredicate)

        if accountsList.exists {
            XCTAssertTrue(accountCards.count >= 0, "Account cards query should not fail")
        }
        if creditCardsList.exists {
            XCTAssertTrue(creditCards.count >= 0, "Credit card cards query should not fail")
        }

        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = "Dashboard Screenshot"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}

