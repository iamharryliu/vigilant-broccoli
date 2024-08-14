package util

func isValid(s string) bool {
	stack := []rune{}
	hmap := map[rune]rune{']': '[', '}': '{', ')': '('}

	for _, char := range s {
		if char == '[' || char == '{' || char == '(' {
			stack = append(stack, char)
		} else if char == ']' || char == '}' || char == ')' { // Is closing bracket.
			if len(stack) == 0 || hmap[char] != stack[len(stack)-1] {
				return false
			}
			stack = stack[:len(stack)-1]
		} else {
			return false
		}
	}
	return len(stack) == 0
}
