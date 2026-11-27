namespace Grind75;

public static class ValidParentheses
{
    private static readonly Dictionary<char, char> CloseToOpen = new()
    {
        [')'] = '(',
        [']'] = '[',
        ['}'] = '{',
    };

    public static bool IsValid(string s)
    {
        var stack = new Stack<char>();
        foreach (var c in s)
        {
            if (!CloseToOpen.TryGetValue(c, out var open))
            {
                stack.Push(c);
            }
            else if (stack.Count == 0 || stack.Pop() != open)
            {
                return false;
            }
        }
        return stack.Count == 0;
    }
}
