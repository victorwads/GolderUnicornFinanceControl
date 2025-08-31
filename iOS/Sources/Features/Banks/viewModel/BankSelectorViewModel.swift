//
//  BankSelectorViewModel.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 15/01/24.
//

import Foundation

class BankSelectorViewModel: ObservableObject {
    
    @Published var showBanksSelector = false
    @Published var banks: [Bank] = []
    
    private var provider: RepositoriesProvider?
    init(provider: RepositoriesProvider? = nil) { self.provider = provider }
    func setProvider(_ provider: RepositoriesProvider?) { self.provider = provider }

    func fetch() {
        provider?.loadBanks(forceCache: false) { self.banks = $0 }
    }
    
    func search(_ text: String) {
        provider?.filterBanks(search: text) { self.banks = $0 }
    }

}
