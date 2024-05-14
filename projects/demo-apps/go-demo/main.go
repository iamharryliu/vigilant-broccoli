package main

import "fmt"

func main() {
	string_value := "value"
	number_value := 3.14

	// Println
	fmt.Println("String Value: ", string_value, "\nNumber Value: ", number_value)
	fmt.Println()

	// Printf
	fmt.Printf("Type: %T", string_value)
	fmt.Println()
	fmt.Printf("String Value: %v\nNumber Value: %v", string_value, number_value)
	fmt.Printf("Number Value: %f", number_value)
	fmt.Println()
	fmt.Printf("Number Value: %0.1f", number_value)
	fmt.Println()

	// Sprintf
	concatenated_str := fmt.Sprintf("String Value: %v\nNumber Value: %v", string_value, number_value)
	fmt.Println(concatenated_str)

	// Arrays
	values := []int{1, 2, 3, 4}
	fmt.Println(
		values,
		len(values),
		values[1:4],
		values[:3],
		values[2:],
		append(values, 5),
	)

}
