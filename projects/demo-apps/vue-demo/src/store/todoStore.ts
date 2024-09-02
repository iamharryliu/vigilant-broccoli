import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import { TODO_API_URL, TODO_HEADERS } from '@/config'

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
      console.error('Error fetching todos: ', error)
    }
  }

  const createTodo = async (title: string) => {
    try {
      const response = await axios.post(
        TODO_API_URL,
        {
          title
        },
        TODO_HEADERS
      )
      const payload = {
        ...response.data,
        id:
          todos.value.reduce((max, todo) => {
            return todo.id > max ? todo.id : max
          }, Number.NEGATIVE_INFINITY) + 1
      }
      todos.value = [...todos.value, payload]
    } catch (error) {
      console.error('Error creating todo:', error)
    }
  }

  const updateTodo = async (updatedTodo: Todo) => {
    try {
      const response = await axios.put(
        `${TODO_API_URL}/${updatedTodo.id}`,
        updatedTodo,
        TODO_HEADERS
      )
      const payload = response.data
      todos.value = todos.value.map((todo) => (updatedTodo.id === todo.id ? payload : todo))
    } catch (error) {
      console.error('Error updating todo: ', error)
    }
  }

  const deleteTodo = async (id: number) => {
    try {
      const response = await axios.delete(`${TODO_API_URL}/${id}`, TODO_HEADERS)
      if (response.status === 200) todos.value = todos.value.filter((todo) => todo.id != id)
    } catch (error) {
      console.log('Error deleting todo: ', error)
    }
  }

  return {
    todos,
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo
  }
})
