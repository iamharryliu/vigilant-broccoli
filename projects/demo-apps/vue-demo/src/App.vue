<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Index</RouterLink>
    </nav>
  </header>
  <RouterView />
</template>
