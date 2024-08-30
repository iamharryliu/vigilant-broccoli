# Vue

- [Vue.js Cheatsheet](https://devhints.io/vue)

```
npm create vue@latest
npm run format
npm run dev
```

## Basics

### Routing

```
// ./src/router/index.ts

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', name: 'home', component: Component
    }
  ]
})

```

```
<RouterLink :to="hardcodedLink"></RouterLink>
<RouterLink :to="linkVariable"></RouterLink>
```

### Template

#### Interpolation

```
<span> {{ msg }} </span>
<span v-text='msg'></span>
<span v-html='rawHTML'></span>
```

#### Binding

```
<a :href="url">...</a>
<button :disabled="isButtonDisabled">...</button>
<div :class="{ active: isActive }">...</div>
```

#### Conditional Rendering

```
<p v-if="condition"></p>
<p v-else-if="condition"></p>
<p v-else></p>
```

```
<p v-show="showProductDetails">...</p>
```

#### List Rendering

```
<li v-for='item in items' :key='item.key'></li>
<li v-for='(item, index) in items'></li>
```

## Components

- `<template>` Defines the HTML structure.
- `<script>` Contains the component's logic.
- `<style>` Adds styles specific to the component.

## Event Handling

```
<button v-on:click="function">Reverse Message</button>
<button @click="function">Toggle Login Status</button>
<button @click="function(arg)">Toggle Login Status</button>
```

## Form Handling

- v-model - Create two-way data binding on form inputs.

```
const ref = ref(null);
console.log(ref.value)

<input
  v-model="ref"
  @blur="blurHandler"
  @keyup.enter="enterHandler"
>
```

## Lifecycle Hooks

- `onMounted()` - Called after the component is mounted to the DOM.
- `onUpdated()` - Called after a reactive data change causes a re-render.
- `unUnmounted()`- Called right before the component is removed from the DOM.
