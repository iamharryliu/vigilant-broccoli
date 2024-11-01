//
//  Item.swift
//  swift-demo
//
//  Created by Harry Liu on 2024-11-01.
//

import Foundation
import SwiftData

@Model
final class Item {
    var timestamp: Date

    init(timestamp: Date) {
        self.timestamp = timestamp
    }
}
