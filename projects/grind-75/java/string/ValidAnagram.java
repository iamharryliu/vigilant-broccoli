package grind75.string;

import java.util.HashMap;
import java.util.Map;

public class ValidAnagram {
    public static boolean isAnagram(String s, String t) {
        if (s.length() != t.length()) {
            return false;
        }
        Map<Character, Integer> count = new HashMap<>();
        for (char c : s.toCharArray()) {
            count.merge(c, 1, Integer::sum);
        }
        for (char c : t.toCharArray()) {
            if (!count.containsKey(c)) {
                return false;
            }
            if (count.merge(c, -1, Integer::sum) < 0) {
                return false;
            }
        }
        return true;
    }
}
