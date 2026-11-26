namespace Grind75;

public static class TwoSum
{
    public static int[] Solve(int[] nums, int target)
    {
        var store = new Dictionary<int, int>();
        for (var i = 0; i < nums.Length; i++)
        {
            if (store.TryGetValue(nums[i], out var index))
            {
                return new[] { index, i };
            }
            store[target - nums[i]] = i;
        }
        return Array.Empty<int>();
    }
}
