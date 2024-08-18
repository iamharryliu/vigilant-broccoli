# Leet Code

## Top Coding Interview Concepts

### Heaps

Efficient for priority queues and finding the k smallest or largest in a collection.

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

## Nuances Between Languages

| Builtin Data Structure | Python | Typescript | Go  |
| :--------------------: | :----: | :--------: | :-: |
|   Default Dictionary   |   Y    |     N      |     |

### Default Dictionary

#### Python

```
hmap = {}
for c in s:
	hmap[c] = hmap.get(c, 0) + 1
hmap.items()
hmap.keys()
hmap.values()
```

```
math.inf
min(n1,n2)
max(n1,n2)
abs(n)
```

```
nums.sort()
```

#### Typescript

```
const hmap:{[key:string]:number} = {}
for (const key of s){
	hmap[key] = (hmap[key] || 0) + 1
}
Object.entries(hmap)
Object.keys(hmap)
Object.entires(hmap)
```

```
Math.infinity
Math.min(n1,n2)
Math.max(n1,n2)
Math.abs(n)
```

```
nums.sort((a,b) => a - b)
```
