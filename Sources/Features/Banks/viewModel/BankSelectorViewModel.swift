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
    
    let repository: BanksRepository
    
    init(repository: BanksRepository = BanksRepository()) {
        self.repository = repository
    }

    func fetch() {
        repository.getAll() {result in
            self.banks = result
        }
    }
    
    func search(_ text: String) {
        repository.getFiltered(search: text) {result in
            self.banks = result
        }
    }

}
