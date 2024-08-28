<script setup lang="ts">
import { RouterLink } from 'vue-router'

const COLLAPSABLE_NAVBAR_CONTENT = {
  ID: 'navbarSupportedContent',
  LINKS: ['todo']
}

const toggle = () => {}
const collapse = () => {}

const toTitleCase = (str: string) =>
  str.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
      <div class="container-fluid">
        <RouterLink class="navbar-brand" to="/">Home</RouterLink>
        <button class="navbar-toggler" type="button" @click="toggle">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" :id="COLLAPSABLE_NAVBAR_CONTENT.ID">
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item" v-for="link in COLLAPSABLE_NAVBAR_CONTENT.LINKS" :key="link">
              <RouterLink class="nav-link" :to="link" @click="collapse">{{
                toTitleCase(link)
              }}</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>
</template>
