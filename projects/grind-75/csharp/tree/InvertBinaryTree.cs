namespace Grind75;

public static class InvertBinaryTree
{
    public static TreeNode? InvertTreeIterative(TreeNode? root)
    {
        var stack = new Stack<TreeNode?>();
        stack.Push(root);
        while (stack.Count > 0)
        {
            var node = stack.Pop();
            if (node != null)
            {
                (node.left, node.right) = (node.right, node.left);
                stack.Push(node.left);
                stack.Push(node.right);
            }
        }
        return root;
    }

    public static TreeNode? InvertTreeRecursive(TreeNode? root)
    {
        if (root == null)
        {
            return null;
        }
        (root.left, root.right) = (InvertTreeRecursive(root.right), InvertTreeRecursive(root.left));
        return root;
    }
}
