class Node:
    def __init__(self, val=0, neighbors=None):
        self.val = val
        self.neighbors = neighbors if neighbors is not None else []


def build_graph(adjList):
    nodes = {}

    for val, neighbors in enumerate(adjList, 1):
        nodes[val] = Node(val)

    for index, neighbors in enumerate(adjList, 1):
        node = nodes[index]
        for neighbor_val in neighbors:
            node.neighbors.append(nodes[neighbor_val])

    return nodes[1] if nodes else None


def get_adjacenly_list(node):
    if not node:
        return []

    adj_list = {}
    queue = [node]
    visited = set()

    while queue:
        current = queue.pop(0)
        if current not in visited:
            visited.add(current)
            adj_list[current.val] = [neighbor.val for neighbor in current.neighbors]
            queue.extend(current.neighbors)

    adjacency_list = [adj_list[val] for val in sorted(adj_list.keys())]
    return adjacency_list
