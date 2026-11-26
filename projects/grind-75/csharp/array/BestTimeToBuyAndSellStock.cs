namespace Grind75;

public static class BestTimeToBuyAndSellStock
{
    public static int MaxProfit(int[] prices)
    {
        var maxProfit = 0;
        var minPrice = int.MaxValue;
        foreach (var price in prices)
        {
            minPrice = Math.Min(minPrice, price);
            maxProfit = Math.Max(maxProfit, price - minPrice);
        }
        return maxProfit;
    }
}
