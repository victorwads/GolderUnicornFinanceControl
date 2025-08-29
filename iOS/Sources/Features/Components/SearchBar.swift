//
//  SearchBar.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 15/01/24.
//

import SwiftUI

struct SearchBar: View {
    @Binding var text: String
    let onChange: (String) -> Void
    let onSearch: (String) -> Void = {_ in }
    
    var body: some View {
        HStack {
            TextField("Pesquisar", text: $text)
                .padding()
                .onChange(of: text, perform: onChange)

            Button(action: { text = ""; onChange(text) }) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.gray)
            }
            .padding(.trailing)
            .opacity(text.isEmpty ? 0 : 1)
        }
        .background(Color(.systemGray6))
        .cornerRadius(10)
        .padding(.horizontal)
        .padding(.vertical, 10)
    }
}


#Preview {
    SearchBar(text: .constant(""), onChange: {_ in})
}
