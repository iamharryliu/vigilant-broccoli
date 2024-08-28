<script setup lang="ts">
import NavbarComponent from './NavbarComponent.vue'
</script>

<template>
  <NavbarComponent />
  <main class="pt-4 container">
    <slot />
  </main>
</template>
