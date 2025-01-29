# Go

| Filename | Description                                    |
| :------- | :--------------------------------------------- |
| main.go  | Main file, entry to application.               |
| mod.go   | Module file defining version and dependencies. |

```
go mod init APP_NAME
go run FILENAME
go get PACKAGE_NAME
go get -u PACKAGE_NAME
```

## Types

### Basic Types

- **bool** - Boolean type (`true` or `false`)
- **string** - String of characters
- **int** - Integer (default size, platform-dependent)
- **int8** - 8-bit signed integer
- **int16** - 16-bit signed integer
- **int32** - 32-bit signed integer
- **int64** - 64-bit signed integer
- **uint** - Unsigned integer (default size, platform-dependent)
- **uint8 (byte)** - 8-bit unsigned integer
- **uint16** - 16-bit unsigned integer
- **uint32** - 32-bit unsigned integer
- **uint64** - 64-bit unsigned integer
- **uintptr** - Unsigned integer large enough to hold a pointer
- **float32** - 32-bit floating point
- **float64** - 64-bit floating point
- **complex64** - Complex number with `float32` real and imaginary parts
- **complex128** - Complex number with `float64` real and imaginary parts

### Composite Types

- **array** - Fixed-size collection of elements (e.g., `[3]int`)
- **slice** - Dynamic-size collection of elements (`[]int`)
- **map** - Key-value pairs (`map[string]int`)
- **struct** - Collection of named fields
- **pointer** - Stores memory address (`*int`)
- **function** - Function types (`func(int) string`)
- **interface** - Defines a set of method signatures (`interface{}`)
- **channel** - Communication between goroutines (`chan int`)

### Alias Types

- **rune** - Alias for `int32`, represents a Unicode code point
- **byte** - Alias for `uint8`, represents a byte

### Special Types

- **error** - Built-in interface for errors (`error`)
- **nil** - Zero value for pointers, slices, maps, functions, channels, and interfaces

## Variables

```
var variableName TYPE
var variableName TYPE = value
var variableName = value
// Inferred Declaration := can only be used within a function.
variableName := value
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

### Declaration

```
var arr [LENGTH]TYPE
var arr := [LENGTH]TYPE{...vals}
var arr := [LENGTH]TYPE{otherArr...}
var arr := [...]TYPE{otherArr...}
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
// For Loop
for i := 0; i < n; i++ {
    ...
}
for condition{
    ...
}

// For Each
for i, val := range LIST {
    ...
}
for key, value := range HMAP {
    ...
}
for i, c := range STR {
    ...
}

// While Loop
for {
    if condition {
        break
    }
}

continue
break
```

## Hashmap/Objects

```
var hmap map[KEY_TYPE]VALUE_TYPE
hmap = make(map[KEY_TYPE]VALUE_TYPE)
```
