package grind75.array;

import java.util.HashMap;
import java.util.Map;

public class TwoSum {
    public static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> store = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer index = store.get(nums[i]);
            if (index != null) {
                return new int[] {index, i};
            }
            store.put(target - nums[i], i);
        }
        return new int[] {};
    }
}
