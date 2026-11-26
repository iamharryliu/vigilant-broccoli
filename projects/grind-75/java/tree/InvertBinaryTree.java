package grind75.tree;

import grind75.common.TreeNode;
import java.util.ArrayDeque;
import java.util.Deque;

public class InvertBinaryTree {
    public static TreeNode invertTreeIterative(TreeNode root) {
        if (root == null) {
            return null;
        }
        // ArrayDeque rejects nulls, so only real nodes go on the stack.
        Deque<TreeNode> stack = new ArrayDeque<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode node = stack.pop();
            TreeNode left = node.left;
            node.left = node.right;
            node.right = left;
            if (node.left != null) {
                stack.push(node.left);
            }
            if (node.right != null) {
                stack.push(node.right);
            }
        }
        return root;
    }

    public static TreeNode invertTreeRecursive(TreeNode root) {
        if (root == null) {
            return null;
        }
        TreeNode left = root.left;
        root.left = invertTreeRecursive(root.right);
        root.right = invertTreeRecursive(left);
        return root;
    }
}
