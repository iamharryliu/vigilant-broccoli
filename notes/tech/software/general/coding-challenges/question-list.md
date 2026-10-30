# Coding Challenge Question List

## Table of Contents

- [Grind 75](#grind-75)
- [References](#references)

## Grind 75

| Question | Type | Technique | Walkthrough |
| :-- | :-- | :-- | :-- |
| 1. Two Sum | Array | Hashmap | Loop through nums while storing indexes of the numbers; check if the difference between the target and the value is in the store, if so return the stored index and the current index |
| 2. Valid Parentheses | String | Stack | Stack and dictionary of close:open brackets -> loop through chars -> push opening brackets -> for a closing bracket return false if stack is empty or the bracket does not match stack.pop() -> return stack is empty on loop exit |
| 3. Merge Two Sorted Lists | Linked List | Dummy Node | Create a dummy node (return dummy.next) -> loop through l1 and l2 adding the lesser value -> when a list is exhausted append the other list |
| 4. Best Time to Buy and Sell Stock | Array | Sliding Window | Track max_profit and min_price while looping through prices |
| 5. Valid Palindrome | String | Two Pointers | Track left, right indices -> while left < right -> skip indices that are not alphanumeric -> return false if lowercase characters differ -> advance pointers -> return true on loop exit |
| 6. Invert/Flip Binary Tree | Tree | DFS | If not root return None, else recursively swap left and right node |
| 7. Valid Anagram | String | Hashmap | Create 2 objects to track character counts of both strings -> loop through strings, increment counters and compare objects |
| 8. Binary Search | Array | Binary Search | l, r, mid = (l+r)//2 |
| 9. Flood Fill | Graph | DFS / BFS | DFS through grid and replace old values with new values |
| 10. Lowest Common Ancestor of BST | Tree | BST Traversal | While root: move root towards p and q |
| 11. Balanced Binary Tree | Tree | DFS | DFS left and right nodes, if the difference in height is greater than 1 return False |
| 12. Linked List Cycle | Linked List | Fast/Slow Pointers | While slow is not fast: if slow == fast return True |
| 13. Implement Queue using Stacks | Stack | Two Stacks | Easy |
| 14. First Bad Version | Array | Binary Search | mid = (l+r)//2, if isBadVersion: r = mid-1 else l = mid+1 |
| 15. Ransom Note | String | Hashmap | Loop through characters in ransomNote and compare counts of characters |
| 16. Climbing Stairs | Dynamic Programming | DP | Fib question, all_ways = two_steps_before + one_step_before |
| 17. Longest Palindrome | String | Hashmap |  |
| 18. Reverse a Linked List | Linked List | Iterative Pointers | prev = None -> while head -> current = head -> head = head.next -> current.next = prev -> prev = current |
| 19. Majority Element | Array | Boyer-Moore Voting | Character hashmap, return n when hashmap[n] > len(nums)//2 |
| 20. Add Binary | String | Math / Carry |  |
| 21. Diameter of Binary Tree | Tree | DFS | Keep track of max while dfs(), return max(left, right) + 1 |
| 22. Middle of the Linked List | Linked List | Fast/Slow Pointers | While fast and fast.next: slow = slow.next, fast = fast.next.next |
| 23. Maximum Depth of Binary Tree | Tree | DFS | Recursive: if not node return 0, else 1 + max depth of left/right |
| 24. Contains Duplicate | Array | Hashmap | Compare set length and list length OR use hash table |
| 25. Maximum Subarray | Array | Greedy (Kadane's) | Kadane's algorithm, manipulate array so that each value is the cumulative positive sum of preceding values |
| 26. Insert Interval | Interval | Sorted Scan | Loop through intervals, three conditions: smaller than interval, greater than interval, overlapping intervals |
| 27. 01 Matrix | Graph | Multi-Source BFS | BFS from all 0 values, grid[nR][nC] = grid[r][c] + 1 |
| 28. K Closest Points to Origin | Heap | Heap | Pythagorean theorem + heaps |
| 29. Longest Substring without Repeating Characters | String | Sliding Window | Track start, maxLength and char indices, check for start <= usedChar[c] |
| 30. 3Sum | Array | Two Pointers | Loop sorted nums, use index i and left and right pointers to keep track |
| 31. Binary Tree Level Order Traversal | Tree | BFS | BFS queue, append values to res |
| 32. Clone Graph | Graph | DFS | Hashmap {node: copy}, dfs through nodes and neighbor nodes |
| 33. Evaluate Reverse Polish Notation | Stack | Stack |  |
| 34. Course Schedule | Graph | DFS | Hashmap {course: prereqs -> []} and visited courses, dfs through all the courses and look for a cycle (not able to complete courses) |
| 35. Implement Trie (Prefix Tree) | Tree | Trie | TrieNode: children = {}, isEnd = False, use common sense to build the rest of the functions |
| 36. Coin Change | Dynamic Programming | DP | Bottom up: keep track of smallest amount of change to make amount |
| 37. Product of Array Except Self | Array | Prefix/Suffix Products | `[1, 2, 3, 4, 5]` -> `[1,1,2,6,24]` x `[1,5,20,60,120]`; loop through once to make an array of products before each element, again for products after each element |
| 38. Min Stack | Stack | Auxiliary Min Stack | Easy |
| 39. Validate Binary Search Tree | Tree | DFS | Recursively check isValidBST -> if not node return true, if greater/less than floor/ceil return false, return isValidBST of left and right nodes |
| 40. Number of Islands | Graph | DFS | Iterate through the grid checking for a 1, run dfs on adjacent nodes to flip them, increment a count |
| 41. Rotting Oranges | Graph | BFS | Count fresh oranges and use a queue to BFS from rotten cells until all oranges are rotten or the queue is empty |
| 42. Search in Rotated Sorted Array | Array | Binary Search | Use binary search to search left and right side portions while changing the left and right pointers appropriately |
| 43. Combination Sum | Dynamic Programming | DP | This is actually a permutation question, track numbers required to make every value |
| 44. Permutations | Recursion | Backtracking | Recursive backtracking to loop through all possible characters, add when len(com) == len(nums) |
| 45. Merge Intervals | Interval | Sort | Sort intervals, result = [intervals[0]], loop through intervals checking if the interval overlaps the previous value added to result |
| 46. Lowest Common Ancestor of BT | Tree | DFS |  |
| 47. Time Based Key-Value Store | Design | Hashmap + Binary Search |  |
| 48. Accounts Merge | Graph | Union Find / DFS |  |
| 49. Sort Colors | Array | Two Pointers | Three pointers: l, r, i |
| 50. Word Break | Dynamic Programming | DP | `dp = [False] * (len(s)+1)`, dp[len(s)] = True, return dp[0], loop backwards through string checking if words allow a passage to dp[len(s)] |
| 51. Partition Equal Subset Sum | Dynamic Programming | DP (Knapsack) |  |
| 52. String to Integer (atoi) | String | Parsing |  |
| 53. Spiral Matrix | Matrix | Boundary Pointers | Keep track of left, top, right, bottom and spiral through the matrix adding values into the result |
| 54. Subsets | Recursion | Backtracking |  |
| 55. Binary Tree Right Side View | Tree | BFS / DFS | BFS or DFS and add rightmost values to res |
| 56. Longest Palindromic Substring | String | Expand Around Center | Track result and loop through string checking for the longest palindrome from inner to outer using a helper function |
| 57. Unique Paths | Dynamic Programming | DP | `row = [1] * n` and create new rows based on newRow[i+1] + row[i], return row[0] |
| 58. Construct Binary Tree from Preorder and Inorder Traversal | Tree | DFS | Use recursion to create the tree using preorder[0] as the root |
| 59. Container With Most Water | Array | Two Pointers | Track left, right, width, and maxArea |
| 60. Letter Combinations of a Phone Number | Recursion | Backtracking |  |
| 61. Word Search | Matrix | DFS / Backtracking | Use a set to keep track of visited, check each cell and dfs to see if you can complete the word |
| 62. Find All Anagrams in a String | String | Sliding Window | Hashmap count for the word letters and hashmap for the current window, if they are equal add index |
| 63. Minimum Height Trees | Graph | Topological Sort (Leaf Trimming) |  |
| 64. Task Scheduler | Heap | Heap + Queue | Use heap to keep track of available tasks and queue to keep track of unavailable tasks while keeping track of time |
| 65. LRU Cache | Design | Hashmap + Doubly Linked List |  |
| 66. Kth Smallest Element in a BST | Tree | Inorder DFS | Create a stack of nodes on the left side of the BST (smallest values) -> pop nodes from the stack with k -= 1 until k is 0 to find the nth smallest node |
| 67. Minimum Window Substring | String | Sliding Window | Track window, countT, have, need, res, resLen; increment have when condition is satisfied and decrement when window[charL] < countT[charL] |
| 68. Serialize and Deserialize Binary Tree | Tree | Preorder DFS | Turn tree into a preorder array (first element is always the root, next is the left node), use the preorder array to recreate the tree |
| 69. Trapping Rain Water | Array | Two Pointers | Track l, r, lMax, rMax, res |
| 70. Find Median from Data Stream | Heap | Two Heaps | Max heap (lesser sorted half) and min heap (greater sorted half), return either the odd value or the average of the tops of the min and max heap |
| 71. Word Ladder | Graph | BFS |  |
| 72. Basic Calculator | Stack | Stack |  |
| 73. Maximum Profit in Job Scheduling | Dynamic Programming | DP + Binary Search |  |
| 74. Merge K Sorted Lists | Linked List | Heap / Divide and Conquer | Helper function to merge 2 lists, keep merging lists until there is only 1 list |
| 75. Largest Rectangle in Histogram | Array | Monotonic Stack | `stack = [(index, height)]`, res = 0, loop through heights and add to stack, pop from stack and calculate area whenever a new height is less than the previous height, loop through the stack to clean up final values and compare rectangles |

## References

- [Grind 75](https://www.techinterviewhandbook.org/grind75/)
