package util

import "testing"

func TestIsValid(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"()", true},
		{"()[]{}", true},
		{"(]", false},
	}

	for _, test := range tests {
		result := isValid(test.input)
		if result != test.expected {
			t.Errorf("isValid(%q) = %v; expected %v", test.input, result, test.expected)
		}
	}
}
