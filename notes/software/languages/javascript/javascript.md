# Javascript

## Types

- string
- number
- boolean
- null
- undefined

### Type Annotation

- [JSDocs](https://devhints.io/jsdoc)
- [Typescript](https://www.typescriptlang.org/)

#### JSDocs

```
//@ts-check

{Type}
{Type1|Type2}
{Object}
{Object.<key, value>}
{Promise<Type>}

@typedef {Type}
@type {Type}
@returns {Type}
@throws {Error}

/**
*@whatever
*/
```

### JS to TS Conversion

```
.jsconfig
{
  "compilerOptions": {
    "allowJs": true,
    "checkJs": true
  },
  "include": ["**/*.js"]
}

import { whatever } from 'whatever';
const {} = require('whatever')

module.exports = {...}
export const whatever

filename.js
filename.ts

node FILENAME
npx tsx FILENAME

tsconfig.json
```

## Console

```
console.log(message)
console.warn(message)
console.error(message)
console.dir(object)
console.table(array_or_object  )
console.assert(condition, message)
console.time()
console.timeEnd()
```

## Debug

- [Freeze screen & inspect disappearing elements #DevToolsTips](https://www.youtube.com/watch?v=Qzmb9bdNzZ4&list=WL&index=18)

```
debugger
throw new Error("STOP");
```

nx

## Arrays

```
arr.map((val) => val);
arr.filter((val) => condition);
arr.reduce((total, val) => val + total, total_start_value);
arr.forEach((val) => do_something);
arr.find((val) => value);
arr.some((val) => condition);
arr.every((val) => condition);
arr.includes(value);
```

## Objects

```
Object.keys(object)
Object.values(object)
```

## Async / Asynchronous Functions

### Promises

```
Promise.resolve(data)
.then((result) => {
  doSomethingWithData(data);
});

Promise.reject(error)
.catch((error) => {
  doSomethingWithError(error);
});

let myPromise = new Promise((resolve, reject) => {
    if (success) {
        resolve(...);
    } else {
        reject(...);
    }
});

myPromise.then((data) => {
  doSomethingWithData(data);
}).catch((error) => {
  doSomethingWithError(error);
});


const promises = [promise1, ...]
Promise.all(promises)
.then((data) => {
  doSomethingWithData(data); // Array of resolved values
})
.catch((error) => {
  doSomethingWithError(error); // First rejected promise
});

Promise.race([promise1, promise2, promise3])
.then((data) => {
  doSomethingWithData(data); // Value of the first resolved promise
})
.catch((error) => {
  doSomethingWithError(error); // Reason of the first rejected promise
});

Promise.allSettled([promise1, promise2, promise3])
.then((results) => {
  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      doSomethingWithData(result.value);
    } else {
      doSomethingWithError(result.reason);
    }
  });
});

Promise.any([promise1, promise2, promise3])
.then((data) => {
  doSomethingWithData(data); // Value of the first resolved promise
})
.catch((error) => {
  doSomethingWithError(error); // AggregateError if all promises reject
});
```
