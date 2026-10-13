import { useEffect, useMemo, useState } from 'react';
import { bubbleTimeline, quickTimeline } from '../lib/sortRace.mjs';

const initial = [44, 16, 83, 31, 68, 12, 91, 56, 27, 74, 38, 63];
const speeds = { slow: 240, normal: 130, fast: 55 };

function Track({ name, complexity, frames, tick, kind }) {
  const done = tick >= frames.length - 1;
  const state = frames[Math.min(tick, frames.length - 1)];
  const sorted = new Set(state.sorted);
  return (
    <div className={`sort-track sort-track-${kind} ${done ? 'is-done' : ''}`}>
      <div className="sort-track-heading"><div><span>{kind === 'bubble' ? '01 / ADJACENT SWAPS' : '02 / DIVIDE & CONQUER'}</span><h3>{name}</h3></div><b>{complexity}</b></div>
      <div className="sort-stage" role="img" aria-label={`${name}：${done ? '已完成' : '运行中'}，比较 ${state.comparisons} 次，交换 ${state.swaps} 次`}>
        <div className="sort-grid" aria-hidden="true"><i /><i /><i /></div>
        <div className="sort-bars" aria-hidden="true">
          {state.values.map((value, index) => <div key={index} className={`sort-bar ${state.active.includes(index) ? 'is-active' : ''} ${state.pivot === index ? 'is-pivot' : ''} ${sorted.has(index) ? 'is-sorted' : ''}`} style={{ '--bar-height': `${value}%` }}><span>{value}</span></div>)}
        </div>
      </div>
      <div className="sort-track-status"><span className={done ? 'sort-status-done' : ''}>{done ? '● SORTED' : `↳ ${state.note}`}</span><span>{String(Math.min(tick, frames.length - 1)).padStart(2, '0')} / {frames.length - 1}</span></div>
      <div className="sort-track-meter"><span style={{ width: `${Math.min(100, tick / Math.max(1, frames.length - 1) * 100)}%` }} /></div>
      <div className="sort-metrics"><div><span>COMPARISONS</span><strong>{state.comparisons}</strong></div><div><span>SWAPS</span><strong>{state.swaps}</strong></div></div>
    </div>
  );
}

export default function SortRace() {
  const [values, setValues] = useState(initial);
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState('normal');
  const bubble = useMemo(() => bubbleTimeline(values), [values]);
  const quick = useMemo(() => quickTimeline(values), [values]);
  const end = Math.max(bubble.length, quick.length) - 1;

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => setTick(current => Math.min(end, current + 1)), speeds[speed]);
    return () => window.clearInterval(timer);
  }, [playing, speed, end]);
  useEffect(() => { if (tick >= end && playing) setPlaying(false); }, [tick, end, playing]);

  function shuffle() {
    setPlaying(false);
    setTick(0);
    const next = Array.from({ length: 12 }, (_, index) => index * 7 + 12);
    for (let i = next.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [next[i], next[j]] = [next[j], next[i]];
    }
    setValues(next);
  }

  return (
    <div className="sort-console">
      <div className="sort-console-top"><div><span className="live-dot" /> SORTING RACE / LIVE TRACE</div><span>SHARED INPUT · TWO STRATEGIES</span></div>
      <div className="sort-race-head"><div><span className="kicker">ALGORITHM RACE_</span><h3>同一组数字，<em>两种路径。</em></h3><p>并排观察冒泡排序与快速排序怎样移动数据。每一拍展示一次比较、交换或基准归位；轨迹长度不代表实际运行时间。</p></div><div className="sort-input"><span>INPUT ARRAY</span><strong>[ {values.join(', ')} ]</strong></div></div>
      <div className="sort-race-grid"><Track kind="bubble" name="Bubble sort" complexity="O(n²)" frames={bubble} tick={tick} /><Track kind="quick" name="Quick sort" complexity="平均 O(n log n)" frames={quick} tick={tick} /></div>
      <div className="sort-controls"><div className="sort-control-buttons"><button type="button" className="action action-primary" onClick={() => { if (tick >= end) setTick(0); setPlaying(current => !current); }}>{playing ? '暂停 Ⅱ' : tick >= end ? '再运行 ↗' : '开始竞速 ↗'}</button><button type="button" className="action" disabled={playing || tick >= end} onClick={() => setTick(current => Math.min(end, current + 1))}>单步 →</button><button type="button" className="action" onClick={() => { setPlaying(false); setTick(0); }}>重置 ↺</button><button type="button" className="action" onClick={shuffle}>重排数据 ⤨</button></div><label className="sort-speed">SPEED <select value={speed} onChange={event => setSpeed(event.target.value)}><option value="slow">慢速</option><option value="normal">标准</option><option value="fast">快速</option></select></label></div>
      <p className="sort-footnote" role="status">{tick >= end ? '两种算法都完成了排序。试试重排数据，观察另一组输入。' : '亮色标出当前比较的位置；青色代表基准值，绿色代表已确定的位置。'}</p>
    </div>
  );
}
