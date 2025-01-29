package handlers

import (
	"encoding/json"
	"net/http"
	"regexp"
	"strconv"
)

type Todo struct {
	UserID    int    `json:"userId"`
	ID        int    `json:"id"`
	Title     string `json:"title"`
	Completed bool   `json:"completed"`
}

var todoIDPattern = regexp.MustCompile(`^/todos/(\d+)$`)

func GetTodosHandler(w http.ResponseWriter, r *http.Request) {
	resp, _ := http.Get("https://jsonplaceholder.typicode.com/todos")
	defer resp.Body.Close()

	var todos []Todo
	json.NewDecoder(resp.Body).Decode(&todos)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

func PostTodoHandler(w http.ResponseWriter, r *http.Request) {
	var todo Todo
	json.NewDecoder(r.Body).Decode(&todo)

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(todo)
}

func PutTodoHandler(w http.ResponseWriter, r *http.Request) {
	matches := todoIDPattern.FindStringSubmatch(r.URL.Path)
	todoID, _ := strconv.Atoi(matches[1])

	var updatedTodo Todo
	json.NewDecoder(r.Body).Decode(&updatedTodo)
	updatedTodo.ID = todoID

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(updatedTodo)
}

func DeleteTodoHandler(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusNoContent)
}
