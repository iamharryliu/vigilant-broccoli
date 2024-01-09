# Grind

## Snippets

```

python -m unittest

python -m unittest discover

python -m unittest -v

python -m unittest discover -v

```

## Notes

### Top Coding Interview Concepts

- heaps

  - top O(n)

  - insert O(logn)

  - remove O(logn)

- heapify O(n)

- sliding window

- binary search

- bfs & dfs (use for trees and graphs)

- recursion

- hashmaps

### Tips

#### Graphs

- conditions: check range, visited, conditions

#### Intervals

- pre-sort list

### Paste Bin

#### Matrix

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

## References

The code exercises in this repo follow the Leet Code questions from the [Grind 75 List](https://www.techinterviewhandbook.org/grind75).
