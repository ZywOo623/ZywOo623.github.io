export const graphNodes = [
  { id: 'A', x: 70, y: 220 },
  { id: 'B', x: 210, y: 90 },
  { id: 'C', x: 220, y: 340 },
  { id: 'D', x: 390, y: 135 },
  { id: 'E', x: 440, y: 345 },
  { id: 'F', x: 590, y: 155 },
  { id: 'G', x: 650, y: 335 }
];

export const graphEdges = [
  { a: 'A', b: 'B', weight: 4 },
  { a: 'A', b: 'C', weight: 2 },
  { a: 'B', b: 'C', weight: 1 },
  { a: 'B', b: 'D', weight: 5 },
  { a: 'C', b: 'D', weight: 8 },
  { a: 'C', b: 'E', weight: 10 },
  { a: 'D', b: 'E', weight: 2 },
  { a: 'D', b: 'F', weight: 6 },
  { a: 'E', b: 'F', weight: 3 },
  { a: 'E', b: 'G', weight: 5 },
  { a: 'F', b: 'G', weight: 1 }
].map(edge => ({ ...edge, id: `${edge.a}-${edge.b}`, enabled: true }));

export function dijkstraTimeline(nodes, edges, start, target) {
  const ids = nodes.map(node => node.id);
  if (!ids.includes(start) || !ids.includes(target)) throw new Error('Invalid start or target node');
  const distances = Object.fromEntries(ids.map(id => [id, Infinity]));
  const previous = {};
  const visited = new Set();
  distances[start] = 0;

  const snapshot = (current, message, done = false, path = []) => ({
    current,
    message,
    done,
    path: [...path],
    visited: [...visited],
    distances: { ...distances }
  });
  const steps = [snapshot(null, `从 ${start} 出发，每轮选择距离最短的未访问节点。`)];

  while (visited.size < ids.length) {
    const current = ids
      .filter(id => !visited.has(id))
      .sort((left, right) => distances[left] - distances[right])[0];
    if (!current || !Number.isFinite(distances[current])) break;
    visited.add(current);
    for (const edge of edges) {
      if (!edge.enabled || (edge.a !== current && edge.b !== current)) continue;
      const neighbor = edge.a === current ? edge.b : edge.a;
      const candidate = distances[current] + edge.weight;
      if (candidate < distances[neighbor]) {
        distances[neighbor] = candidate;
        previous[neighbor] = current;
      }
    }
    steps.push(snapshot(current, `确定 ${current} 的最短距离：${distances[current]}。检查相邻边并更新距离。`));
    if (current === target) break;
  }

  const path = [];
  if (Number.isFinite(distances[target])) {
    for (let node = target; node; node = previous[node]) {
      path.unshift(node);
      if (node === start) break;
    }
  }
  const connected = path[0] === start;
  steps.push(snapshot(target, connected
    ? `最短路径：${path.join(' → ')}，总代价 ${distances[target]}。`
    : `${start} 与 ${target} 之间没有可达路径。`, true, connected ? path : []));
  return steps;
}
