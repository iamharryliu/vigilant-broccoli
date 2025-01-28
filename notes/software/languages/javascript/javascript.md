# Javascript

## Types

- `string`
- `number`
- `boolean`
- `null`
- `undefined`

### Type Annotation

- [JSDocs](https://devhints.io/jsdoc)
- [Typescript](https://www.typescriptlang.org/)

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

## Debugging

```
console.warn(message);
console.error(message);
console.dir(object);
console.table(array_or_object);
console.assert(condition, message);
console.time();
console.timeEnd();

// debugger keyword
debugger;

// throw error
throw new Error("STOP");
```

- [Freeze screen & inspect disappearing elements #DevToolsTips](https://www.youtube.com/watch?v=Qzmb9bdNzZ4&list=WL&index=18)c

## Array

| Method                                                        | Example Input                       | Example Output |
| ------------------------------------------------------------- | ----------------------------------- | -------------- |
| `arr.map((val) => val);`                                      | `[1, 2, 3]`                         | `[1, 2, 3]`    |
| `arr.filter((val) => condition);`                             | `[1, 2, 3, 4]` with `val > 2`       | `[3, 4]`       |
| `arr.reduce((total, val) => val + total, total_start_value);` | `[1, 2, 3]` with `0` as start       | `6`            |
| `arr.forEach((val) => do_something);`                         | `[1, 2, 3]` with `console.log(val)` | Logs `1 2 3`   |
| `arr.find((val) => value);`                                   | `[1, 2, 3, 4]` with `val > 2`       | `3`            |
| `arr.some((val) => condition);`                               | `[1, 2, 3]` with `val > 2`          | `true`         |
| `arr.every((val) => condition);`                              | `[2, 4, 6]` with `val % 2 === 0`    | `true`         |
| `arr.includes(value);`                                        | `[1, 2, 3]` with `2`                | `true`         |

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
