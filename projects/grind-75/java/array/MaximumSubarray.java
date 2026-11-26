package grind75.array;

public class MaximumSubarray {
    public static int maxSubArray(int[] nums) {
        int best = nums[0];
        int current = 0;
        for (int num : nums) {
            current = Math.max(current, 0) + num;
            best = Math.max(best, current);
        }
        return best;
    }
}
