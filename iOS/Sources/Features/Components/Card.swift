//
//  Card.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 15/01/24.
//

import SwiftUI

struct Card<Content>: View where Content : View {
    
    @ViewBuilder let content: () -> Content
    
    var body: some View {
        VStack(alignment: .leading, content: content)
        .frame(maxWidth: /*@START_MENU_TOKEN@*/.infinity/*@END_MENU_TOKEN@*/)
        .padding()
        .background(Color.black.opacity(0.1))
        .cornerRadius(10)
    }
}

#Preview {
    Card {
        Text("Blablabla")
        Text("Blablabla")
    }
}
