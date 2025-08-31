import Foundation
import FirebaseAuth
import FirebaseFirestore
import FirebaseCrashlytics

class CreditCardInvoicesRepository: RepositoryBase<CreditCardInvoice> {
    init(userId: String? = nil) {
        guard let userId = userId ?? Auth.auth().currentUser?.uid else {
            let error = NSError(domain: "Auth", code: 401, userInfo: [NSLocalizedDescriptionKey: "Invalid userId"])
            Crashlytics.crashlytics().record(error: error)
            fatalError(error.localizedDescription)
        }
        super.init(collectionPath: "\(Collections.Users)/\(userId)/\(Collections.CreditCardInvoices)")
    }

    func addInvoice(_ invoice: CreditCardInvoice, completion: @escaping (Bool) -> Void) {
        do {
            try collectionRef.addDocument(from: invoice) { e in
                completion(e == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }

    func editInvoice(_ invoice: CreditCardInvoice, completion: @escaping (Bool) -> Void) {
        guard let id = invoice.id else {
            completion(false)
            return
        }
        do {
            try collectionRef.document(id).setData(from: invoice, merge: true) { e in
                completion(e == nil)
            }
        } catch {
            Crashlytics.crashlytics().record(error: error)
            completion(false)
        }
    }
}
