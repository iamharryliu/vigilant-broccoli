namespace Grind75;

public static class LowestCommonAncestorOfBST
{
    public static TreeNode? LowestCommonAncestorIterative(TreeNode? root, TreeNode p, TreeNode q)
    {
        while (root != null)
        {
            if (p.val < root.val && q.val < root.val)
            {
                root = root.left;
            }
            else if (root.val < p.val && root.val < q.val)
            {
                root = root.right;
            }
            else
            {
                return root;
            }
        }
        return null;
    }

    public static TreeNode? LowestCommonAncestorRecursive(TreeNode? root, TreeNode p, TreeNode q)
    {
        if (root == null)
        {
            return null;
        }
        if (p.val < root.val && q.val < root.val)
        {
            return LowestCommonAncestorRecursive(root.left, p, q);
        }
        if (root.val < p.val && root.val < q.val)
        {
            return LowestCommonAncestorRecursive(root.right, p, q);
        }
        return root;
    }
}
