namespace Grind75;

public static class BinarySearch
{
    public static int Search(int[] nums, int target)
    {
        var l = 0;
        var r = nums.Length - 1;
        while (l <= r)
        {
            var mid = l + (r - l) / 2;
            if (nums[mid] == target)
            {
                return mid;
            }
            if (nums[mid] < target)
            {
                l = mid + 1;
            }
            else
            {
                r = mid - 1;
            }
        }
        return -1;
    }
}
