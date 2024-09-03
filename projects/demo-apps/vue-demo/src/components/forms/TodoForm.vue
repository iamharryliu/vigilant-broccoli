<template>
  <form @submit.prevent="handleSubmit">
    <div class="input-group mb-3">
      <span class="input-group-text" @click="handleSubmit"> Todo </span>
      <input type="text" v-model="todo" class="form-control" placeholder="Add new todo" />
      <button class="btn btn-outline-secondary" type="submit">Add Todo</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useTodoStore } from '../../store/todoStore'

const todoStore = useTodoStore()
const { createTodo } = todoStore
const todo = ref('')

const handleSubmit = () => {
  if (todo.value) {
    createTodo(todo.value)
    todo.value = ''
  }
}
</script>
