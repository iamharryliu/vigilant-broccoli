# Leet Code

## Top Coding Interview Concepts

### Heaps

- top O(n)

- insert O(logn)

- remove O(logn)

- heapify O(n)

# Sliding Window

# Binary Search

# BFS & DFS (for trees and graphs)

# Recursion

## Tips

### Graphs

- conditions: check range, visited, conditions

### Intervals

- pre-sort list

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

### Hashmap and dictionaries

```
dp[key] = dp.get(key, 0)
```
