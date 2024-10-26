# Go

Run script

```
go run [filename]
```

## Variables

```
var variableName type
var variableName type = value
var variableName := value
const CONST_NAME type
const CONST_NAME type = value
const CONST_NAME := value
```

## Printing / Logging

```
fmt.Print(stringValue)
fmt.Println(stringValue)
fmt.Printf("Any value: %v", value)
fmt.Printf("String value: %s", value)
fmt.Printf("Decimal valueL: %d", value)
fmt.Printf("Floating point values: %f", value)
fmt.Printf("Rounded floating point values: %.nf", value)
fmt.Printf("Boolean: %t", value)
fmt.Printf("Type: %T", value)

log.Print("This is a log message.")
log.Println("This is a log message.")
log.Printf("%s", "This is a log message.")
```

## Conditionals

```
if condition {
    ...
} else if (condition) {
    ...
} else {
    ...
}

// Conditionally check for value to use if it exists.
if val, ok := store[key]; ok {
    ...
}
```

## List Objects

### Arrays

```
var arr [n]type
var arr := [n]type{n1, n2..}
var arr := [n]type{arr...}
```

### Slices

```
var slice []type
var slice := []type{n1,n2..}
var slice := []type{slice...}
```

## List Methods

```
var combinedSlice = append(list, "Date")
var combinedSlice := append(list, otherSlice...)
```

## Iteration

```
for i := 1; i < 5; i++ { }
for [condition] { }
```

For Each

```
for i, val := range vals {
    ...
}
```

While Loop

```
for { ... }
```

## Hashmap

```
var hmap map[key_type]value_type
hmap = make(map[key_type]value_type)
```
