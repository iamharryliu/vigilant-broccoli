import unittest
from tree.serialize_and_deserialize_BT import Codec
from tree.common import BinaryTree


class TestSolution(unittest.TestCase):
    def test(self):
        root = [1, 2, 3, None, None, 4, 5]
        tree = BinaryTree.array_to_tree(root)
        res = BinaryTree.to_bfs_traversal_array(
            Codec.deserialize(Codec.serialize(tree))
        )
        self.assertEqual(res, root)

        root = []
        tree = BinaryTree.array_to_tree(root)
        res = BinaryTree.to_bfs_traversal_array(
            Codec.deserialize(Codec.serialize(tree))
        )
        self.assertEqual(res, root)
