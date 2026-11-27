namespace Grind75;

public static class ValidAnagram
{
    public static bool IsAnagram(string s, string t)
    {
        if (s.Length != t.Length)
        {
            return false;
        }
        var count = new Dictionary<char, int>();
        foreach (var c in s)
        {
            count[c] = count.GetValueOrDefault(c) + 1;
        }
        foreach (var c in t)
        {
            if (!count.ContainsKey(c))
            {
                return false;
            }
            count[c]--;
            if (count[c] < 0)
            {
                return false;
            }
        }
        return true;
    }
}
