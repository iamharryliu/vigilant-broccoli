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
const todo = ''
const handleSubmit = () => {}
</script>
