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
<span> {{ interpolatedValue }} </span>
<span v-text='text'></span>
<span v-html='html'></span>
```

#### Binding

```
<a :href="url">...</a>
<div :disabled="isDisabled">...</div>
<div :class="{ active: isActive }">...</div>
<div :style="{ color: color }">
```

#### Conditional Rendering

```
<div v-if="condition"></div>
<div v-else-if="condition"></div>
<div v-else></div>
<div v-show="isVisible">...</div>
```

#### List Rendering

```
<li v-for='item in items' :key='item.key'></li>
<li v-for='(item, index) in items' :key='item.key'></li>
<li v-for="(value, key) in object" :key='object.key'></li>
```

## Event Handling

```
<button v-on:click="function">Reverse Message</button>
<button @click="function">Toggle Login Status</button>
<button @click="function(arg)">Toggle Login Status</button>

```

### Form Handling

- v-model - Create two-way data binding on form inputs.

```
const ref = ref(null);

<form @submit.prevent="handleSubmit">
  <input
    v-model="ref"
    @blur="blurHandler"
    @keyup.enter="enterHandler"
  />
</form>
```

## Lifecycle Hooks

- `onMounted()` - Called after the component is mounted to the DOM.
- `onUpdated()` - Called after a reactive data change causes a re-render.
- `unUnmounted()`- Called right before the component is removed from the DOM.

## Components

### Component Anatomy

```
Vue.component('component-name', {
  components: {
    ...components
  },
  props: {
    ...propsAcceptedByComponent
  },
  data: function() {
    // `data` must be a function
    return {
      ...data
    }
  },
  computed: {
    // Return cached values until dependencies change
    ...computedValues
  },
  watch: {
    // Called when watchValue changes value
    watchValue: function (value, oldValue) { ... }
  },
  methods: { ... },
  template: '...',
  // Can also use backticks in `template` for multi-line
})
```

#### Single File Components

- `<template>` Defines the HTML structure.
- `<script>` Contains the component's logic.
- `<style>` Adds styles specific to the component.

```
<template>
  ...
</template>
<script src="./component.js"></script>
<style src="./component.css"></style>
```

#### Slots

```
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot>Default content</slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

```
<app-layout>
  <h1 slot="header">Page title</h1>
  <p>the main content.</p>
  <p slot="footer">Contact info</p>
</app-layout>
```
