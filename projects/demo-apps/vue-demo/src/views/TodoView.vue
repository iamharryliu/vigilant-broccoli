<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

const todos = ref([])

onMounted(async () => {
  try {
    const response = await axios.get('https://jsonplaceholder.typicode.com/todos')
    todos.value = response.data.slice(0, 10)
  } catch (error) {
    console.error('Error fetching todos:', error)
  }
})
</script>

<template>
  <main class="container">
    <h1>Todo</h1>
    <ul class="list-group">
      <template v-if="todos.length">
        <li class="list-group-item" v-for="todo in todos" :key="todo.id">
          <span>
            {{ todo.title }}
          </span>
          <div class="float-end">
            <button class="btn btn-primary me-2">Edit</button>
            <button class="btn btn-danger">Delete</button>
          </div>
        </li>
      </template>
      <p v-else class="text-center my-4">You currently have no todo items.</p>
    </ul>
  </main>
</template>
