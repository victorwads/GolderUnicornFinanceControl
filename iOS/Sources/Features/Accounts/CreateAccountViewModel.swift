//
//  CreateAccountViewModel.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 15/01/24.
//

import Foundation

class CreateAccountViewModel: ObservableObject {
    
    @Published var selectedBank: Bank? = nil
    @Published var account: Account = Account()
    @Published var state: ScreenState = .initial
    
    var provider: RepositoriesProvider?
    
    func save(onSuccess: @escaping () -> Void) {
        state = .loading
        account.bankId = selectedBank?.id
        provider?.addAccount(account) { success in
            if(success) {
                self.state = .success
                onSuccess()
            } else {
                self.state = .error
            }
        }
    }
    
    enum ScreenState {
        case initial
        case loading
        case success
        case error
    }
}
