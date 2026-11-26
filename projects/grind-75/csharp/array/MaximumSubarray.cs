namespace Grind75;

public static class MaximumSubarray
{
    public static int MaxSubArray(int[] nums)
    {
        var best = nums[0];
        var current = 0;
        foreach (var num in nums)
        {
            current = Math.Max(current, 0) + num;
            best = Math.Max(best, current);
        }
        return best;
    }
}
