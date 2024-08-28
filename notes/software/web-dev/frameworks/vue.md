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
<li v-for="link in items" :key="item.key">
```

#### Event Handling

```
<button v-on:click="function">Reverse Message</button>
<button @click="function">Toggle Login Status</button>
<button @click="function(arg)">Toggle Login Status</button>
```
