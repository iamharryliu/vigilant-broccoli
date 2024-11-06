
import SwiftUI
import SwiftData

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @State private var todos: [Todo] = []

    var body: some View {
        NavigationSplitView {
            List {
                ForEach(todos) { todo in
                    NavigationLink {
                        Text(todo.title)
                            .font(.headline)
                        Text("Completed: \(todo.completed ? "Yes" : "No")")
                            .font(.subheadline)
                            .foregroundColor(todo.completed ? .green : .red)
                    } label: {
                        Text(todo.title)
                    }
                }
                .onDelete(perform: deleteTodo)
            }
            .onAppear {
                fetchAllTodos()
            }
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    EditButton()
                }
                ToolbarItem {
                    Button(action: addTodo) {
                        Label("Add Item", systemImage: "plus")
                    }
                }
            }
        } detail: {
            Text("Select an item")
        }
    }

    private func addTodo() {
        withAnimation {
            let newId = (todos.map { $0.id }.max() ?? 0) + 1
            let newItem = Todo(
                id: newId,
                title: "New",
                completed: false
            )
            todos.insert(newItem, at: 0)
        }
    }

    private func deleteTodo(at offsets: IndexSet) {
            todos.remove(atOffsets: offsets)
    }

    private func fetchAllTodos() {
        let urlString = Constants.TODO_URL
        guard let url = URL(string: urlString) else {
            print("Invalid URL")
            return
        }

        let task = URLSession.shared.dataTask(with: url) { data, response, error in
            if let error = error {
                print("Error fetching todos:", error)
                return
            }

            guard let data = data else {
                print("No data returned")
                return
            }

            do {
                let todos = try JSONDecoder().decode([Todo].self, from: data)
                DispatchQueue.main.async {
                    self.todos = todos
                }
            } catch {
                print("Error decoding JSON:", error)
            }
        }
        task.resume()
    }
}
