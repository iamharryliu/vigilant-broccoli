import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { TODO_ENDPOINT } from '@/config'

export type Todo = {
  id: number
  title: string
}

export const useTodoStore = defineStore('todo', () => {
  const todos = ref<Todo[]>([])

  const fetchTodos = async () => {
    try {
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
      todos.value = response.data.slice(0, 10)
    } catch (error) {
      console.error('Error fetching todos:', error)
    }
  }

  const createTodo = async (title: string) => {
    try {
      const response = await axios.post(
        TODO_ENDPOINT.CREATE_TODO,
        {
          title
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      const payload = response.data
      todos.value = [...todos.value, payload]
    } catch (error) {
      console.error('Error creating todo:', error)
    }
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
    createTodo,
    updateTodo,
    deleteTodo
  }
})
