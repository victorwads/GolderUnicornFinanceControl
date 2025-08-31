import SwiftUI

struct EditAccountScreen: View {
    let account: Account

    var body: some View {
        Form {
            Text("Editar conta \(account.name)")
        }
        .navigationTitle("Editar Conta")
    }
}

#Preview {
    EditAccountScreen(account: Account())
}
