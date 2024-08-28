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

const editingId = ref<number|null>(null);
const editingValue = ref<string|null>(null);

const handleEditClick = (todo) => {
  editingId.value = todo.id
  editingValue.value = todo.title
};

const handleTodoUpdate = () =>{
  if (!editingValue.value) {
    deleteTodo(editingId);
    return;
  }
  updateTodo({id:editingId.value, title: editingValue.value});
  editingId.value=null
  editingValue.value=''
}

const updateTodo = (updatedTodo) => {
  todos.value = todos.value.map(todo => (updatedTodo.id === todo.id ? updatedTodo : todo))
}

const deleteTodo = (id: number) => {
  todos.value = todos.value.filter(todo=>todo.id!=id)
}
</script>

<template>
  <main class="container">
    <h1>Todo</h1>
    <ul class="list-group">
      <template v-if="todos.length">
        <li class="list-group-item" v-for="todo in todos" :key="todo.id">
          <input
          v-if="editingId === todo.id"
                type="text"
                v-model="editingValue"
                @blur="handleTodoUpdate"
                @keyup.enter="handleTodoUpdate"
              />
          <span v-else @click="handleEditClick(todo)">
            {{ todo.title }}
          </span>
          <div class="float-end">
            <button class="btn btn-primary me-2" @click="handleEditClick(todo)">Edit</button>
            <button class="btn btn-danger" @click="deleteTodo(todo.id)">Delete</button>
          </div>
        </li>
      </template>
      <p v-else class="text-center my-4">You currently have no todo items.</p>
    </ul>
  </main>
</template>
