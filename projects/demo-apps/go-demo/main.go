package main

import (
	"fmt"
	"net/http"
)

func indexHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Hello, World!")
}

func main() {
	http.HandleFunc("/", indexHandler)
	port := ":8080"
	fmt.Println("Server running on http://localhost" + port)
	http.ListenAndServe(port, nil)
}
