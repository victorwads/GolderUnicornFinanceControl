//
//  Category.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 17/01/24.
//

import Foundation
import FirebaseFirestore

struct Category: Codable, Identifiable {
    var parentId: String? = nil
    @DocumentID var id: String? = nil
    var name: String = ""
    var icon: String? = nil
    var color: String? = nil
    
    enum CodingKeys: String, CodingKey {
        case id
        case name
        case icon
        case parentId
        case color
    }
}
