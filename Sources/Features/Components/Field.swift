//
//  Field.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 15/01/24.
//

import SwiftUI

struct Field: View {
    let label: String
    let hint: String = ""
    @Binding var text: String
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .font(.caption)
                .foregroundColor(.gray)
            
            TextField(hint, text: $text)
                .padding(10)
                .background(Color(UIColor.systemGray6))
                .cornerRadius(5)
        }
    }
}

#Preview {
    Form {
        Field(label: "Username", text: .constant("User"))
    }
}
