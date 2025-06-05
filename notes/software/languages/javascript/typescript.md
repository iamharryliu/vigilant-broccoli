# Typescript

## Debugging

```
console.log(Date.now())
console.time('something');
console.timeEnd('something');
```

## Falsy Values

```
""
0
NaN
null
undefined
false
```

## Utility Types

| **Utility Type** | **Description**                                                                    | **Example**                                                                     |
| ---------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Omit<T, K>`     | Creates a type by excluding specific keys (`K`) from type `T`.                     | `Omit<{a: number; b: string}, 'b'>` → `{a: number}`                             |
| `Exclude<T, U>`  | Excludes specific types (`U`) from a union (`T`).                                  | `Exclude<'a' \| 'b' \| 'c', 'b'>` → `'a' \| 'c'`                                |
| `Pick<T, K>`     | Creates a type by picking specific keys (`K`) from type `T`.                       | `Pick<{a: number; b: string}, 'a'>` → `{a: number}`                             |
| `Partial<T>`     | Makes all properties of type `T` optional.                                         | `Partial<{a: number; b: string}>` → `{a?: number; b?: string}`                  |
| `Required<T>`    | Makes all properties of type `T` required.                                         | `Required<{a?: number; b?: string}>` → `{a: number; b: string}`                 |
| `Record<K, T>`   | Creates an object type with keys (`K`) of a specified type and values of type `T`. | `Record<'a' \| 'b', number>` → `{a: number; b: number}`                         |
| `Extract<T, U>`  | Extracts types from a union (`T`) that are assignable to `U`.                      | `Extract<'a' \| 'b' \| 'c', 'b'>` → `'b'`                                       |
| `Readonly<T>`    | Makes all properties of type `T` immutable (read-only).                            | `Readonly<{a: number; b: string}>` → `{readonly a: number; readonly b: string}` |
| `NonNullable<T>` | Removes `null` and `undefined` from type `T`.                                      | `NonNullable<string \| null \| undefined>` → `string`                           |
