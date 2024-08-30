<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTodoStore } from '../store/todoStore.ts'
import { storeToRefs } from 'pinia'

const todoStore = useTodoStore()
const { todos } = storeToRefs(todoStore)
const { fetchTodos, updateTodo, deleteTodo } = todoStore

const editingId = ref<number | null>(null)
const editingValue = ref<string | null>(null)

onMounted(async () => {
  await fetchTodos()
})

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

</script>

<template>
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
</template>
