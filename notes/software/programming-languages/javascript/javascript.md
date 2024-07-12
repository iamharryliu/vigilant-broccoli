# Javascript

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
