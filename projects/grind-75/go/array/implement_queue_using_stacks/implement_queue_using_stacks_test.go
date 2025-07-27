package main

import (
	"reflect"
	"testing"
)

var (
	ops      = []string{"MyQueue", "push", "push", "peek", "pop", "empty"}
	args     = [][]int{{}, {1}, {2}, {}, {}, {}}
	expected = []interface{}{nil, nil, nil, 1, 1, false}
)

func TestMyQueueOperations(t *testing.T) {
	var obj MyQueue
	var results []interface{}

	for i, op := range ops {
		switch op {
		case "MyQueue":
			obj = Constructor()
			results = append(results, nil)
		case "push":
			obj.Push(args[i][0])
			results = append(results, nil)
		case "pop":
			val := obj.Pop()
			results = append(results, val)
		case "peek":
			val := obj.Peek()
			results = append(results, val)
		case "empty":
			val := obj.Empty()
			results = append(results, val)
		default:
			t.Fatalf("Unknown operation: %s", op)
		}
	}

	if !reflect.DeepEqual(results, expected) {
		t.Errorf("Results mismatch.\nGot:  %#v\nWant: %#v", results, expected)
	}
}
