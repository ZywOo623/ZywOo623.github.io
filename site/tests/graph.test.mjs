import test from 'node:test';
import assert from 'node:assert/strict';
import { dijkstraTimeline, graphEdges, graphNodes } from '../src/lib/graph.mjs';

test('finds the shortest path on the default weighted graph', () => {
  const final = dijkstraTimeline(graphNodes, graphEdges, 'A', 'G').at(-1);
  assert.deepEqual(final.path, ['A', 'C', 'B', 'D', 'E', 'F', 'G']);
  assert.equal(final.distances.G, 14);
});

test('updates the route when an edge is disabled', () => {
  const edges = graphEdges.map(edge => ({ ...edge, enabled: edge.id !== 'B-D' }));
  const final = dijkstraTimeline(graphNodes, edges, 'A', 'G').at(-1);
  assert.deepEqual(final.path, ['A', 'C', 'E', 'F', 'G']);
  assert.equal(final.distances.G, 16);
});

test('shows an unreachable target honestly', () => {
  const edges = graphEdges.map(edge => ({ ...edge, enabled: edge.a !== 'G' && edge.b !== 'G' }));
  const final = dijkstraTimeline(graphNodes, edges, 'A', 'G').at(-1);
  assert.deepEqual(final.path, []);
  assert.equal(final.distances.G, Infinity);
});
