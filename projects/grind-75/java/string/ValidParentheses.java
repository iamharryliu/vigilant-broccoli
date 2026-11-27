package grind75.string;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;

public class ValidParentheses {
    private static final Map<Character, Character> CLOSE_TO_OPEN =
        Map.of(')', '(', ']', '[', '}', '{');

    public static boolean isValid(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            Character open = CLOSE_TO_OPEN.get(c);
            if (open == null) {
                stack.push(c);
            } else if (stack.isEmpty() || !stack.pop().equals(open)) {
                return false;
            }
        }
        return stack.isEmpty();
    }
}
