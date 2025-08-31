import SwiftUI

struct CategoriesScreen: View {
    @State private var categories: [Category] = []
    private let repo = CategoriesRepository()

    var body: some View {
        List(categories, id: \.id) { cat in
            Text(cat.name)
        }
        .onAppear { load() }
        .navigationTitle("Categorias")
    }

    private func load() {
        repo.getAll { cats in
            self.categories = cats
        }
    }
}

#Preview {
    NavigationStack { CategoriesScreen() }
}

