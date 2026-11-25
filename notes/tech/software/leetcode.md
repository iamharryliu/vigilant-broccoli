# Leet Code

## Table of Contents

- [Language Mapping](#language-mapping)
- [Notes](#notes)
- [Paste Bin](#paste-bin)
  - [Matrix](#matrix)
- [Grind 75](#grind-75)
  - [Grind 75 Questions](#grind-75-questions)
- [References](#references)

## Language Mapping

| Operation | Python | Typescript |
| :-: | :-: | :-: |
| Infinity | math.inf | Infinity |
| Min/Max | min(n1,n2), max(n1,n2) | Math.min(n1,n2), Math.max(n1,n2) |
| Abs | abs(n) | Math.abs(n) |
| Floor | int(n) | Math.floor(n)/Math.trunc(n) |
| Sorting | arr.sort() | arr.sort() |
| Hashmap | hmap = {} | const hmap:{[key:string]:number} = {} |
| Initialize Key Value | hmap[key] = hmap.get(key, 0) + 1 | hmap[key] = (hmap[key] \|\| 0) + 1 |
| Hashmap Objects | hmap.items() | Object.entries(hmap) |
| Hashmap Keys | hmap.keys() | Object.keys(hmap) |
| Hashmap Values | hmap.items() | Object.values(hmap) |

## Notes

- Iterative vs Recursive Solutions

  - Iterative solutions are more memory efficient as they do not build a call stack.
  - Recursive can look less complex.

- Heaps - Efficient for priority queues and finding the k smallest or largest in a collection.
  - top O(n)
  - insert O(logn)
  - remove O(logn)
  - heapify O(n)
- Graphs
  - conditions: check range, visited, conditions
- Intervals
  - Pre-sort list.

## Paste Bin

### Matrix

```
visited = set()
directions = [[1,0],[-1,0],[0,1],[0,-1]]
for r in range(len(grid)):
	for c in range(len(grid[0])):
		if 0<=r<len(grid) and 0<=c<len(grid[0]) and (r,c) not in visited and checkCondition(grid[r][c]):
			for x,y in directions:
				nr = r + x
				nc = c + y
				visited.add(nr,nc)
				do_something([nr,nc])
```

## Grind 75

### Grind 75 Questions

| # | Question | Type | Technique | Time | Space | Walkthrough | LeetCode |
| --: | :-- | :-- | :-- | :-: | :-: | :-- | :-- |
| 1 | [Two Sum](https://grind-75.vigilant-broccoli.app/?file=Array%2FTwo%20Sum) | Array | Hashmap | O(n) | O(n) | Loop through nums while storing indexes of the numbers; check if the difference between the target and the value is in the store, if so return the stored index and the current index | <https://leetcode.com/problems/two-sum/> |
| 2 | [Valid Parentheses](https://grind-75.vigilant-broccoli.app/?file=String%2FValid%20Parenthesis) | String | Stack | O(n) | O(n) | Stack and dictionary of close:open brackets -> loop through chars -> push opening brackets -> for a closing bracket return false if stack is empty or the bracket does not match stack.pop() -> return stack is empty on loop exit | <https://leetcode.com/problems/valid-parentheses/> |
| 3 | [Merge Two Sorted Lists](https://grind-75.vigilant-broccoli.app/?file=Linked%20List%2FMerge%20Two%20Sorted%20Lists) | Linked List | Dummy Node | O(n1 + n2) | O(1) | Create a dummy node (return dummy.next) -> loop through l1 and l2 adding the lesser value -> when a list is exhausted append the other list | <https://leetcode.com/problems/merge-two-sorted-lists/> |
| 4 | [Best Time to Buy and Sell Stock](https://grind-75.vigilant-broccoli.app/?file=Array%2FBest%20Time%20to%20Buy%20and%20Sell%20Stock) | Array | Sliding Window (Kadane's): track max value | O(n) | O(1) | Track max_profit and min_price while looping through prices | <https://leetcode.com/problems/best-time-to-buy-and-sell-stock/> |
| 5 | [Valid Palindrome](https://grind-75.vigilant-broccoli.app/?file=String%2FValid%20Palindrome) | String | Two Pointers | O(n) | O(1) | Track left, right indices -> while left < right -> skip indices that are not alphanumeric -> return false if lowercase characters differ -> advance pointers -> return true on loop exit | <https://leetcode.com/problems/valid-palindrome/> |
| 6 | [Invert/Flip Binary Tree](https://grind-75.vigilant-broccoli.app/?file=Tree%2FInvert%20Binary%20Tree) | Tree | DFS: Iterative Solution | O(n) | O(n) | If not root return None, else recursively swap left and right node | <https://leetcode.com/problems/invert-binary-tree/> |
| 7 | [Valid Anagram](https://grind-75.vigilant-broccoli.app/?file=String%2FValid%20Anagram) | String | Two Hashmaps | O(m + n) | O(n) | Create 2 objects to track character counts of both strings -> loop through strings, increment counters and compare objects | <https://leetcode.com/problems/valid-anagram/> |
| 8 | [Binary Search](https://grind-75.vigilant-broccoli.app/?file=Binary%20Search%2FBinary%20Search) | Array | Binary Search | O(logn) | O(1) | l, r, mid = (l+r)//2 | <https://leetcode.com/problems/binary-search/> |
| 9 | [Flood Fill](https://grind-75.vigilant-broccoli.app/?file=Matrix%2FFlood%20Fill) | Graph | DFS / BFS | O(m x n) | O(m x n) | DFS through grid and replace old values with new values | <https://leetcode.com/problems/flood-fill/> |
| 10 | [Lowest Common Ancestor of BST](https://grind-75.vigilant-broccoli.app/?file=Tree%2FLowest%20Common%20Ancestor%20of%20BST) | Tree | BST Traversal: Iterative Solution | O(h) | O(1) | While root: move root towards p and q | <https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/> |
| 11 | [Balanced Binary Tree](https://grind-75.vigilant-broccoli.app/?file=Tree%2FBalanced%20Binary%20Tree) | Tree | DFS | O(n) | O(n) | DFS left and right nodes, if the difference in height is greater than 1 return False | <https://leetcode.com/problems/balanced-binary-tree/> |
| 12 | [Linked List Cycle](https://grind-75.vigilant-broccoli.app/?file=Linked%20List%2FLinked%20List%20Cycle) | Linked List | Fast/Slow Pointers | O(n) | O(1) | While slow is not fast: if slow == fast return True | <https://leetcode.com/problems/linked-list-cycle/> |
| 13 | [Implement Queue using Stacks](https://grind-75.vigilant-broccoli.app/?file=Array%2FImplement%20Queue%20using%20Stacks) | Stack | Two Stacks | O(n) | O(1) | Easy | <https://leetcode.com/problems/implement-queue-using-stacks/> |
| 14 | [First Bad Version](https://grind-75.vigilant-broccoli.app/?file=Binary%20Search%2FFirst%20Bad%20Version) | Array | Binary Search | O(logn) | O(1) | mid = (l+r)//2, if isBadVersion: r = mid-1 else l = mid+1 | <https://leetcode.com/problems/first-bad-version/> |
| 15 | [Ransom Note](https://grind-75.vigilant-broccoli.app/?file=String%2FRansom%20Note) | String | Hashmap | O(m + n) | O(m + n) | Loop through characters in ransomNote and compare counts of characters | <https://leetcode.com/problems/ransom-note/> |
| 16 | [Climbing Stairs](https://grind-75.vigilant-broccoli.app/?file=Dynamic%20Programming%2FClimbing%20Stairs) | Dynamic Programming | DP | O(n) | O(1) | Fib question, all_ways = two_steps_before + one_step_before | <https://leetcode.com/problems/climbing-stairs/> |
| 17 | [Longest Palindrome](https://grind-75.vigilant-broccoli.app/?file=String%2FLongest%20Palindrome) | String | Hashmap | O(n) | O(n) |  | <https://leetcode.com/problems/longest-palindrome/> |
| 18 | [Reverse a Linked List](https://grind-75.vigilant-broccoli.app/?file=Linked%20List%2FReverse%20Linked%20List) | Linked List | Iterative Pointers | O(n) | O(1) | prev = None -> while head -> current = head -> head = head.next -> current.next = prev -> prev = current | <https://leetcode.com/problems/reverse-linked-list/> |
| 19 | [Majority Element](https://grind-75.vigilant-broccoli.app/?file=Array%2FMajority%20Element) | Array | Boyer-Moore Voting | O(n) | O(1) | Character hashmap, return n when hashmap[n] > len(nums)//2 | <https://leetcode.com/problems/majority-element/> |
| 20 | [Add Binary](https://grind-75.vigilant-broccoli.app/?file=Binary%2FAdd%20Binary) | String | Math / Carry | O(max(m, n)) | O(max(m, n)) |  | <https://leetcode.com/problems/add-binary/> |
| 21 | [Diameter of Binary Tree](https://grind-75.vigilant-broccoli.app/?file=Tree%2FDiameter%20of%20Binary%20Tree) | Tree | DFS | O(n) | O(h) | Keep track of max while dfs(), return max(left, right) + 1 | <https://leetcode.com/problems/diameter-of-binary-tree/> |
| 22 | [Middle of the Linked List](https://grind-75.vigilant-broccoli.app/?file=Linked%20List%2FMiddle%20of%20the%20Linked%20List) | Linked List | Fast/Slow Pointers | O(n) | O(1) | While fast and fast.next: slow = slow.next, fast = fast.next.next | <https://leetcode.com/problems/middle-of-the-linked-list/> |
| 23 | [Maximum Depth of Binary Tree](https://grind-75.vigilant-broccoli.app/?file=Tree%2FMaximum%20Depth%20of%20Binary%20Tree) | Tree | DFS | O(n) | O(1) | Recursive: if not node return 0, else 1 + max depth of left/right | <https://leetcode.com/problems/maximum-depth-of-binary-tree/> |
| 24 | [Contains Duplicate](https://grind-75.vigilant-broccoli.app/?file=Array%2FContains%20Duplicate) | Array | Hashmap | O(n) | O(n) | Compare set length and list length OR use hash table | <https://leetcode.com/problems/contains-duplicate/> |
| 25 | [Maximum Subarray](https://grind-75.vigilant-broccoli.app/?file=Array%2FMaximum%20Subarray) | Array | Greedy (Kadane's): track max value | O(n) | O(1) | Kadane's algorithm, manipulate array so that each value is the cumulative positive sum of preceding values | <https://leetcode.com/problems/maximum-subarray/> |
| 26 | [Insert Interval](https://grind-75.vigilant-broccoli.app/?file=Array%2FInsert%20Interval) | Interval | Sorted Scan | O(n) | O(n) | Loop through intervals, three conditions: smaller than interval, greater than interval, overlapping intervals | <https://leetcode.com/problems/insert-interval/> |
| 27 | [01 Matrix](https://grind-75.vigilant-broccoli.app/?file=Graph%2FZero%20One%20Matrix) | Graph | Multi-Source BFS | O(m × n) | O(m × n) | BFS from all 0 values, grid[nR][nC] = grid[r][c] + 1 | <https://leetcode.com/problems/01-matrix/> |
| 28 | [K Closest Points to Origin](https://grind-75.vigilant-broccoli.app/?file=Heap%2FK%20Closest%20Points%20to%20Origin) | Heap | Heap | O(nlogk) | O(k) | Pythagorean theorem + heaps | <https://leetcode.com/problems/k-closest-points-to-origin/> |
| 29 | [Longest Substring without Repeating Characters](https://grind-75.vigilant-broccoli.app/?file=String%2FLongest%20Substring%20Without%20Repeating%20Characters) | String | Sliding Window | O(n) | O(n) | Track start, maxLength and char indices, check for start <= usedChar[c] | <https://leetcode.com/problems/longest-substring-without-repeating-characters/> |
| 30 | [3Sum](https://grind-75.vigilant-broccoli.app/?file=Array%2FThree%20Sum) | Array | Two Pointers | O(nlogn) | O(n) | Loop sorted nums, use index i and left and right pointers to keep track | <https://leetcode.com/problems/3sum/> |
| 31 | [Binary Tree Level Order Traversal](https://grind-75.vigilant-broccoli.app/?file=Tree%2FBinary%20Tree%20Level%20Order%20Traversal) | Tree | BFS | O(n) | O(n) | BFS queue, append values to res | <https://leetcode.com/problems/binary-tree-level-order-traversal/> |
| 32 | [Clone Graph](https://grind-75.vigilant-broccoli.app/?file=Graph%2FClone%20Graph) | Graph | DFS | O(V + E) | O(V + E) | Hashmap {node: copy}, dfs through nodes and neighbor nodes | <https://leetcode.com/problems/clone-graph/> |
| 33 | [Evaluate Reverse Polish Notation](https://grind-75.vigilant-broccoli.app/?file=Stack%2FEvaluate%20Reverse%20Polish%20Notation) | Stack | Stack | O(n) | O(n) |  | <https://leetcode.com/problems/evaluate-reverse-polish-notation/> |
| 34 | [Course Schedule](https://grind-75.vigilant-broccoli.app/?file=Graph%2FCourse%20Schedule) | Graph | DFS | O(V + E) | O(V + E) | Hashmap {course: prereqs -> []} and visited courses, dfs through all the courses and look for a cycle (not able to complete courses) | <https://leetcode.com/problems/course-schedule/> |
| 35 | [Implement Trie (Prefix Tree)](https://grind-75.vigilant-broccoli.app/?file=Trie%2FImplement%20Trie) | Tree | Trie: TrieNode={children, isEnd} | O(length of word) | O(number of words × length of word) | TrieNode: children = {}, isEnd = False, use common sense to build the rest of the functions | <https://leetcode.com/problems/implement-trie-prefix-tree/> |
| 36 | [Coin Change](https://grind-75.vigilant-broccoli.app/?file=Dynamic%20Programming%2FCoin%20Change) | Dynamic Programming | DP: dp=[...1], dp[0]=0 | O(coins × amount) | O(amount) | Bottom up: keep track of smallest amount of change to make amount | <https://leetcode.com/problems/coin-change/> |
| 37 | [Product of Array Except Self](https://grind-75.vigilant-broccoli.app/?file=Array%2FProduct%20of%20Array%20Except%20Self) | Array | Prefix/Suffix Products | O(n) | O(1) excluding output | `[1, 2, 3, 4, 5]` -> `[1,1,2,6,24]` x `[1,5,20,60,120]`; loop through once to make an array of products before each element, again for products after each element | <https://leetcode.com/problems/product-of-array-except-self/> |
| 38 | [Min Stack](https://grind-75.vigilant-broccoli.app/?file=Array%2FMin%20Stack) | Stack | Auxiliary Min Stack | O(1) | O(n) | Easy | <https://leetcode.com/problems/min-stack/> |
| 39 | [Validate Binary Search Tree](https://grind-75.vigilant-broccoli.app/?file=Tree%2FValidate%20BST) | Tree | DFS | O(n) | O(h) | Recursively check isValidBST -> if not node return true, if greater/less than floor/ceil return false, return isValidBST of left and right nodes | <https://leetcode.com/problems/validate-binary-search-tree/> |
| 40 | [Number of Islands](https://grind-75.vigilant-broccoli.app/?file=Graph%2FNumber%20of%20Islands) | Graph | DFS | O(m × n) | O(m × n) | Iterate through the grid checking for a 1, run dfs on adjacent nodes to flip them, increment a count | <https://leetcode.com/problems/number-of-islands/> |
| 41 | [Rotting Oranges](https://grind-75.vigilant-broccoli.app/?file=Graph%2FRotting%20Oranges) | Graph | BFS | O(m × n) | O(m × n) | Count fresh oranges and use a queue to BFS from rotten cells until all oranges are rotten or the queue is empty | <https://leetcode.com/problems/rotting-oranges/> |
| 42 | [Search in Rotated Sorted Array](https://grind-75.vigilant-broccoli.app/?file=Binary%20Search%2FSearch%20in%20Rotated%20Sorted%20Array) | Array | Binary Search | O(logn) | O(1) | Use binary search to search left and right side portions while changing the left and right pointers appropriately | <https://leetcode.com/problems/search-in-rotated-sorted-array/> |
| 43 | [Combination Sum](https://grind-75.vigilant-broccoli.app/?file=Backtracking%2FCombination%20Sum) | Dynamic Programming | DP | O(target × nums) | O(target) | This is actually a permutation question, track numbers required to make every value | <https://leetcode.com/problems/combination-sum/> |
| 44 | [Permutations](https://grind-75.vigilant-broccoli.app/?file=Recursion%2FPermutations) | Recursion | Backtracking | O(n × n!) | O(n) | Recursive backtracking to loop through all possible characters, add when len(com) == len(nums) | <https://leetcode.com/problems/permutations/> |
| 45 | [Merge Intervals](https://grind-75.vigilant-broccoli.app/?file=Array%2FMerge%20Intervals) | Interval | Sort | O(nlogn) | O(n) | Sort intervals, result = [intervals[0]], loop through intervals checking if the interval overlaps the previous value added to result | <https://leetcode.com/problems/merge-intervals/> |
| 46 | [Lowest Common Ancestor of BT](https://grind-75.vigilant-broccoli.app/?file=Tree%2FLowest%20Common%20Ancestor%20of%20Binary%20Tree) | Tree | DFS | O(n) | O(h) |  | <https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/> |
| 47 | [Time Based Key-Value Store](https://grind-75.vigilant-broccoli.app/?file=Binary%20Search%2FTime%20Based%20Key%20Value%20Store) | Design | Hashmap + Binary Search | Set Fn - O(1), Get Fn - O(logn) | Set Fn - O(n) - Get Fn - O(1) |  | <https://leetcode.com/problems/time-based-key-value-store/> |
| 48 | [Accounts Merge](https://grind-75.vigilant-broccoli.app/?file=Graph%2FAccounts%20Merge) | Graph | Union Find / DFS | O(n × α(n) + nlogn) | O(n) |  | <https://leetcode.com/problems/accounts-merge/> |
| 49 | [Sort Colors](https://grind-75.vigilant-broccoli.app/?file=Array%2FSort%20Colors) | Array | Two Pointers | O(n) | O(1) | Three pointers: l, r, i | <https://leetcode.com/problems/sort-colors/> |
| 50 | [Word Break](https://grind-75.vigilant-broccoli.app/?file=Dynamic%20Programming%2FWord%20Break) | Dynamic Programming | DP: dp=[...False], dp[-1]=True | O(n × m × L) | O(n) | `dp = [False] * (len(s)+1)`, dp[len(s)] = True, return dp[0], loop backwards through string checking if words allow a passage to dp[len(s)] | <https://leetcode.com/problems/word-break/> |
| 51 | [Partition Equal Subset Sum](https://grind-75.vigilant-broccoli.app/?file=Dynamic%20Programming%2FPartition%20Equal%20Subset%20Sum) | Dynamic Programming | DP (Knapsack) | O(n × sum) | O(sum) |  | <https://leetcode.com/problems/partition-equal-subset-sum/> |
| 52 | [String to Integer (atoi)](https://grind-75.vigilant-broccoli.app/?file=String%2FString%20to%20Integer) | String | Parsing | O(n) | O(1) |  | <https://leetcode.com/problems/string-to-integer-atoi/> |
| 53 | [Spiral Matrix](https://grind-75.vigilant-broccoli.app/?file=Matrix%2FSpiral%20Matrix) | Matrix | Boundary Pointers | O(m × n) | O(1) excluding output | Keep track of left, top, right, bottom and spiral through the matrix adding values into the result | <https://leetcode.com/problems/spiral-matrix/> |
| 54 | [Subsets](https://grind-75.vigilant-broccoli.app/?file=Backtracking%2FSubsets) | Recursion | Backtracking | O(n × 2^n) | O(n) |  | <https://leetcode.com/problems/subsets/> |
| 55 | [Binary Tree Right Side View](https://grind-75.vigilant-broccoli.app/?file=Tree%2FBinary%20Tree%20Right%20Side%20View) | Tree | BFS / DFS | O(n) | O(n) | BFS or DFS and add rightmost values to res | <https://leetcode.com/problems/binary-tree-right-side-view/> |
| 56 | [Longest Palindromic Substring](https://grind-75.vigilant-broccoli.app/?file=String%2FLongest%20Palindromic%20Substring) | String | Expand Around Center | O(n^2) | O(1) | Track result and loop through string checking for the longest palindrome from inner to outer using a helper function | <https://leetcode.com/problems/longest-palindromic-substring/> |
| 57 | [Unique Paths](https://grind-75.vigilant-broccoli.app/?file=Dynamic%20Programming%2FUnique%20Paths) | Dynamic Programming | DP: dp=[...1] | O(m×n) | O(n) | `row = [1] * n` and create new rows based on newRow[i+1] + row[i], return row[0] | <https://leetcode.com/problems/unique-paths/> |
| 58 | [Construct Binary Tree from Preorder and Inorder Traversal](https://grind-75.vigilant-broccoli.app/?file=Tree%2FConstruct%20Binary%20Tree%20from%20Preorder%20and%20in%20Order%20Traversal) | Tree | DFS | O(n) | O(n) | Use recursion to create the tree using preorder[0] as the root | <https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/> |
| 59 | [Container With Most Water](https://grind-75.vigilant-broccoli.app/?file=Array%2FContainer%20with%20Most%20Water) | Array | Two Pointers | O(n) | O(1) | Track left, right, width, and maxArea | <https://leetcode.com/problems/container-with-most-water/> |
| 60 | [Letter Combinations of a Phone Number](https://grind-75.vigilant-broccoli.app/?file=Backtracking%2FLetter%20Combinations%20of%20a%20Phone%20Number) | Recursion | Backtracking | O(4^n × n) | O(n) |  | <https://leetcode.com/problems/letter-combinations-of-a-phone-number/> |
| 61 | [Word Search](https://grind-75.vigilant-broccoli.app/?file=Matrix%2FWord%20Search) | Matrix | DFS / Backtracking | O(m × n × 4^L) | O(L) | Use a set to keep track of visited, check each cell and dfs to see if you can complete the word | <https://leetcode.com/problems/word-search/> |
| 62 | [Find All Anagrams in a String](https://grind-75.vigilant-broccoli.app/?file=String%2FFind%20All%20Anagrams) | String | Sliding Window | O(n) | O(1) | Hashmap count for the word letters and hashmap for the current window, if they are equal add index | <https://leetcode.com/problems/find-all-anagrams-in-a-string/> |
| 63 | [Minimum Height Trees](https://grind-75.vigilant-broccoli.app/?file=Graph%2FMinimum%20Height%20Trees) | Graph | Topological Sort (Leaf Trimming) | O(n) | O(n) |  | <https://leetcode.com/problems/minimum-height-trees/> |
| 64 | [Task Scheduler](https://grind-75.vigilant-broccoli.app/?file=Heap%2FTask%20Scheduler) | Heap | Heap + Queue | O(n) | O(1) | Use heap to keep track of available tasks and queue to keep track of unavailable tasks while keeping track of time | <https://leetcode.com/problems/task-scheduler/> |
| 65 | [LRU Cache](https://grind-75.vigilant-broccoli.app/?file=Linked%20List%2FLRU%20Cache) | Design | Hashmap + Doubly Linked List | O(1) | O(capacity) |  | <https://leetcode.com/problems/lru-cache/> |
| 66 | [Kth Smallest Element in a BST](https://grind-75.vigilant-broccoli.app/?file=Tree%2FKth%20Smallest%20Element%20in%20a%20BST) | Tree | Inorder DFS | O(h + k) | O(h) | Create a stack of nodes on the left side of the BST (smallest values) -> pop nodes from the stack with k -= 1 until k is 0 to find the nth smallest node | <https://leetcode.com/problems/kth-smallest-element-in-a-bst/> |
| 67 | [Minimum Window Substring](https://grind-75.vigilant-broccoli.app/?file=String%2FMinimum%20Window%20Substring) | String | Sliding Window | O(m + n) | O(m + n) | Track window, countT, have, need, res, resLen; increment have when condition is satisfied and decrement when window[charL] < countT[charL] | <https://leetcode.com/problems/minimum-window-substring/> |
| 68 | [Serialize and Deserialize Binary Tree](https://grind-75.vigilant-broccoli.app/?file=Tree%2FSerialize%20and%20Deserialize%20Binary%20Tree) | Tree | Preorder DFS | O(n) | O(n) | Turn tree into a preorder array (first element is always the root, next is the left node), use the preorder array to recreate the tree | <https://leetcode.com/problems/serialize-and-deserialize-binary-tree/> |
| 69 | [Trapping Rain Water](https://grind-75.vigilant-broccoli.app/?file=Array%2FTrapping%20Rain%20Water) | Array | Two Pointers | O(n) | O(1) | Track l, r, lMax, rMax, res | <https://leetcode.com/problems/trapping-rain-water/> |
| 70 | [Find Median from Data Stream](https://grind-75.vigilant-broccoli.app/?file=Heap%2FFind%20Median%20from%20Data%20Stream) | Heap | Two Heaps | Add - O(logn), Median - O(1) | O(n) | Max heap (lesser sorted half) and min heap (greater sorted half), return either the odd value or the average of the tops of the min and max heap | <https://leetcode.com/problems/find-median-from-data-stream/> |
| 71 | [Word Ladder](https://grind-75.vigilant-broccoli.app/?file=Graph%2FWord%20Ladder) | Graph | BFS | O(N × L^2) | O(N × L^2) |  | <https://leetcode.com/problems/word-ladder/> |
| 72 | [Basic Calculator](https://grind-75.vigilant-broccoli.app/?file=Stack%2FBasic%20Calculator) | Stack | Stack: stack=[], sign=1, i=0, res=0 | O(n) | O(n) |  | <https://leetcode.com/problems/basic-calculator/> |
| 73 | [Maximum Profit in Job Scheduling](https://grind-75.vigilant-broccoli.app/?file=Binary%20Search%2FMaximum%20Profit%20in%20Job%20Scheduling) | Dynamic Programming | DP + Binary Search | O(nlogn) | O(n) |  | <https://leetcode.com/problems/maximum-profit-in-job-scheduling/> |
| 74 | [Merge K Sorted Lists](https://grind-75.vigilant-broccoli.app/?file=Heap%2FMerge%20K%20Sorted%20Lists) | Linked List | Heap / Divide and Conquer | O(Nlogk) | O(1) | Helper function to merge 2 lists, keep merging lists until there is only 1 list | <https://leetcode.com/problems/merge-k-sorted-lists/> |
| 75 | [Largest Rectangle in Histogram](https://grind-75.vigilant-broccoli.app/?file=Stack%2FLargest%20Rectangle%20in%20Histogram) | Array | Monotonic Stack | O(n) | O(n) | `stack = [(index, height)]`, res = 0, loop through heights and add to stack, pop from stack and calculate area whenever a new height is less than the previous height, loop through the stack to clean up final values and compare rectangles | <https://leetcode.com/problems/largest-rectangle-in-histogram/> |

## References

- [Grind 75](https://www.techinterviewhandbook.org/grind75/)
