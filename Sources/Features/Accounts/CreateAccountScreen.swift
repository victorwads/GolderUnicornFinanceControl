
import SwiftUI

struct CreateAccountScreen: View {
    
    @Environment(\.presentationMode) var presentationMode
    @StateObject private var viewModel = CreateAccountViewModel()
    
    var body: some View {
        Form {
            Field(label: "Nome da Conta", text: $viewModel.account.name)
            BankSelector(selectedBank: $viewModel.selectedBank)
            PriceField(label: "Saldo Inicial", price: $viewModel.account.initialBalance)
            VStack {
                Spacer()
                Text("To Do:").font(.headline)
            }.frame(height: 80)
            Text("- Tipo de Conta").font(.footnote)
            Text("-  Cor da Conta").font(.footnote)
            Text("-  Saldo no Inicio").font(.footnote)
        }
        HStack {
            Button("Cancelar", action: {
                presentationMode.wrappedValue.dismiss()
            } )
                .buttonStyle(.bordered)
            Spacer()
            Button("Salvar", action: {
                viewModel.save() {
                    presentationMode.wrappedValue.dismiss()
                }
            } )
            .disabled(
                viewModel.selectedBank == nil ||
                viewModel.account.name.isEmpty
            )
            .buttonStyle(.borderedProminent)
        }.padding()
        .navigationTitle("Criar Conta")
    }
}

#Preview {
    CreateAccountScreen()
}
