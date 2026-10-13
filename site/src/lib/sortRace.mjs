const frame = (values, comparisons, swaps, active = [], pivot = -1, sorted = [], note = '') => ({
  values: [...values], comparisons, swaps, active, pivot, sorted: [...sorted], note,
});

export function bubbleTimeline(input) {
  const values = [...input];
  const frames = [frame(values, 0, 0, [], -1, [], '从左向右比较相邻元素')];
  let comparisons = 0;
  let swaps = 0;
  for (let end = values.length - 1; end > 0; end--) {
    let moved = false;
    for (let i = 0; i < end; i++) {
      comparisons++;
      frames.push(frame(values, comparisons, swaps, [i, i + 1], -1, values.map((_, index) => index).filter(index => index > end), '比较相邻元素'));
      if (values[i] > values[i + 1]) {
        [values[i], values[i + 1]] = [values[i + 1], values[i]];
        swaps++;
        moved = true;
        frames.push(frame(values, comparisons, swaps, [i, i + 1], -1, values.map((_, index) => index).filter(index => index > end), '交换逆序元素'));
      }
    }
    if (!moved) break;
  }
  frames.push(frame(values, comparisons, swaps, [], -1, values.map((_, index) => index), '排序完成'));
  return frames;
}

export function quickTimeline(input) {
  const values = [...input];
  const sorted = new Set();
  const frames = [frame(values, 0, 0, [], -1, [], '选择区间末尾作为基准值')];
  let comparisons = 0;
  let swaps = 0;
  function partition(left, right) {
    const pivotValue = values[right];
    let boundary = left;
    for (let i = left; i < right; i++) {
      comparisons++;
      frames.push(frame(values, comparisons, swaps, [i, boundary], right, sorted, `比较 ${values[i]} 与基准 ${pivotValue}`));
      if (values[i] <= pivotValue) {
        if (boundary !== i) {
          [values[boundary], values[i]] = [values[i], values[boundary]];
          swaps++;
          frames.push(frame(values, comparisons, swaps, [boundary, i], right, sorted, '移入左侧分区'));
        }
        boundary++;
      }
    }
    if (boundary !== right) {
      [values[boundary], values[right]] = [values[right], values[boundary]];
      swaps++;
    }
    sorted.add(boundary);
    frames.push(frame(values, comparisons, swaps, [boundary], -1, sorted, '基准值归位'));
    return boundary;
  }
  function sort(left, right) {
    if (left > right) return;
    if (left === right) { sorted.add(left); return; }
    const middle = partition(left, right);
    sort(left, middle - 1);
    sort(middle + 1, right);
  }
  sort(0, values.length - 1);
  frames.push(frame(values, comparisons, swaps, [], -1, values.map((_, index) => index), '排序完成'));
  return frames;
}
