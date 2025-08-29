//
//  GlobalExtensions.swift
//  GoldenUnicorn
//
//  Created by Victor Wads Laureano on 14/01/24.
//

import Foundation

extension String {
    func prepareCompare() -> String {
        let normalizedString = self.applyingTransform(.stripCombiningMarks, reverse: false) ?? self
        return normalizedString.lowercased()
    }
}
