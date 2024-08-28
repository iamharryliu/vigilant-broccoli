import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export type Todo = {
  id: number
  title: string
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])
  const editingId = ref<number | null>(null)
  const editingValue = ref<string | null>(null)

  const fetchTodos = async () => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
      todos.value = response.data.slice(0, 10)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const handleEditClick = (todo: Todo) => {
    editingId.value = todo.id
    editingValue.value = todo.title
  }

  const handleTodoUpdate = () => {
    if (!editingValue.value) {
      deleteTodo(editingId.value!)
      return
    }
    updateTodo({ id: editingId.value!, title: editingValue.value })
    editingId.value = null
    editingValue.value = ''
  }

  const updateTodo = (updatedTodo: Todo) => {
    todos.value = todos.value.map((todo) => (updatedTodo.id === todo.id ? updatedTodo : todo))
  }

  const deleteTodo = (id: number) => {
    todos.value = todos.value.filter((todo) => todo.id != id)
  }

  return {
    todos,
    fetchTodos,
    editingId,
    editingValue,
    handleEditClick,
    handleTodoUpdate,
    updateTodo,
    deleteTodo
  }
})
