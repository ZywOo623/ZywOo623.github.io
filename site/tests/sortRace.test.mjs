import test from 'node:test';
import assert from 'node:assert/strict';
import { bubbleTimeline, quickTimeline } from '../src/lib/sortRace.mjs';

for (const [name, timeline] of [['bubble', bubbleTimeline], ['quick', quickTimeline]]) {
  test(`${name} trace sorts duplicates and keeps its input intact`, () => {
    const input = [8, 3, 8, 1, 5, 2];
    const frames = timeline(input);
    assert.deepEqual(input, [8, 3, 8, 1, 5, 2]);
    assert.deepEqual(frames.at(-1).values, [1, 2, 3, 5, 8, 8]);
    assert.deepEqual(frames.at(-1).sorted, [0, 1, 2, 3, 4, 5]);
    assert.ok(frames.at(-1).comparisons > 0);
    assert.ok(frames.every((state, index) => index === 0 ||
      (state.comparisons >= frames[index - 1].comparisons && state.swaps >= frames[index - 1].swaps)));
  });
}
