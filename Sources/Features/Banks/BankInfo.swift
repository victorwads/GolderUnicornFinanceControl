//
//  BankInfo.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 12/01/24.
//

import Foundation
import SwiftUI

struct BankInfo: View {
    var bank: Bank
    let banksResourceUrl = "https://goldenunicornfc.firebaseapp.com/resources/banks/"

    var body: some View {
        HStack {
            AsyncImage(url: URL(string: banksResourceUrl + bank.logoUrl)) { image in image.resizable()
            } placeholder: {
                ProgressView()
            }
            .frame(width: 32, height: 32)
            .clipShape(Circle())
            .padding(.vertical, 8)
            Text(bank.name)
            Spacer()
        }.padding(.horizontal)
    }
}

#Preview {
    VStack(spacing: 0) {
        BankInfo(bank: Bank(name: "Nubank", logoUrl: "nubank.png"))
        Divider()
        BankInfo(bank: Bank(name: "Itaú", logoUrl: "itau.png"))
        Divider()
        BankInfo(bank: Bank(name: "PicPay", logoUrl: "picpay-1.png"))
        Divider()
        BankInfo(bank: Bank(name: "Mercado Pago", logoUrl: "mercadopago.png"))
        Divider()
        BankInfo(bank: Bank(name: "Bradesco", logoUrl: "bradesco.png"))
    }
}
