namespace Grind75;

public static class InsertInterval
{
    public static int[][] Insert(int[][] intervals, int[] newInterval)
    {
        var res = new List<int[]>();
        var i = 0;

        while (i < intervals.Length && intervals[i][1] < newInterval[0])
        {
            res.Add(intervals[i++]);
        }

        while (i < intervals.Length && intervals[i][0] <= newInterval[1])
        {
            newInterval[0] = Math.Min(newInterval[0], intervals[i][0]);
            newInterval[1] = Math.Max(newInterval[1], intervals[i][1]);
            i++;
        }
        res.Add(newInterval);

        while (i < intervals.Length)
        {
            res.Add(intervals[i++]);
        }

        return res.ToArray();
    }
}
