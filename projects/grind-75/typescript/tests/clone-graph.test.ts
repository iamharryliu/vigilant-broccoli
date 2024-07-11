import { cloneGraph } from '../graph/clone-graph';
import { buildGraph, getAdjacencyList } from '../graph/common';

test('cloneGraph test with non-empty adjacency list', () => {
  const adjList = [
    [2, 4],
    [1, 3],
    [2, 4],
    [1, 3],
  ];
  const graph = buildGraph(adjList);
  const res = getAdjacencyList(cloneGraph(graph));
  const expected = [
    [2, 4],
    [1, 3],
    [2, 4],
    [1, 3],
  ];
  expect(res).toEqual(expected);
});

test('cloneGraph test with single empty list', () => {
  const adjList = [[]];
  const graph = buildGraph(adjList);
  const res = getAdjacencyList(cloneGraph(graph));
  const expected = [[]];
  expect(res).toEqual(expected);
});

test('cloneGraph test with empty list', () => {
  const adjList: number[][] = [];
  const graph = buildGraph(adjList);
  const res = getAdjacencyList(cloneGraph(graph));
  const expected: any[] = [];
  expect(res).toEqual(expected);
});
