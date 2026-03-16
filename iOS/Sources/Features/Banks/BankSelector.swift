//
//  BankSelector.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 15/01/24.
//

import Foundation
import SwiftUI


struct BankSelector: View {
    @EnvironmentObject var repos: RepositoriesProvider
    @StateObject var viewModel = BankSelectorViewModel()
    @Binding var selectedBank: Bank?
    @State var serach: String = ""
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Banco")
                .font(.caption)
                .foregroundColor(.gray)
            HStack {
                if let bank = selectedBank {
                    BankInfo(bank: bank)
                } else {
                    Spacer()
                }
                Button("Selecionar", action: { viewModel.showBanksSelector = true })
            }.sheet(isPresented: $viewModel.showBanksSelector, content: {
                VStack {
                    SearchBar(text: $serach, onChange: {search in viewModel.search(search) })
                    List {
                        ForEach(viewModel.banks, id: \.id) { bank in
                            Button(action: {
                                serach = ""
                                selectedBank = bank
                                viewModel.showBanksSelector = false
                            }) {
                                BankInfo(bank: bank)
                            }
                        }
                    }
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .onAppear { viewModel.fetch() }
            })
        }
        .onAppear {
            viewModel.setProvider(repos)
            if viewModel.banks.isEmpty { viewModel.fetch() }
        }
    }
}

#Preview {
    BankSelector(selectedBank: .constant(nil))
        .environmentObject(RepositoriesProvider(uid: "preview")!)
}
#Preview {
    BankSelector(selectedBank: .constant(Bank(name: "TesteBank", logoUrl: "")))
        .environmentObject(RepositoriesProvider(uid: "preview")!)
}
