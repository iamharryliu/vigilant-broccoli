# Leet Code

## Language Mapping

|      Operation       |              Python              |              Typescript               |
| :------------------: | :------------------------------: | :-----------------------------------: |
|       Infinity       |             math.inf             |               Infinity                |
|       Min/Max        |      min(n1,n2), max(n1,n2)      |   Math.min(n1,n2), Math.max(n1,n2)    |
|         Abs          |              abs(n)              |              Math.abs(n)              |
|        Floor         |              int(n)              |      Math.floor(n)/Math.trunc(n)      |
|       Sorting        |            arr.sort()            |              arr.sort()               |
|       Hashmap        |            hmap = {}             | const hmap:{[key:string]:number} = {} |
| Initialize Key Value | hmap[key] = hmap.get(key, 0) + 1 |  hmap[key] = (hmap[key] \|\| 0) + 1   |
|   Hashmap Objects    |           hmap.items()           |         Object.entries(hmap)          |
|     Hashmap Keys     |           hmap.keys()            |           Object.keys(hmap)           |
|    Hashmap Values    |           hmap.items()           |          Object.values(hmap)          |

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
