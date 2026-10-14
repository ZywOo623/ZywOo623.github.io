import { useEffect, useMemo, useRef, useState } from 'react';
import { dijkstraTimeline, graphEdges, graphNodes } from '../lib/graph.mjs';

function inPath(path, a, b) {
  return path.some((node, index) => index > 0 &&
    ((node === a && path[index - 1] === b) || (node === b && path[index - 1] === a)));
}

export default function GraphLab() {
  const stageRef = useRef(null);
  const [start, setStart] = useState('A');
  const [target, setTarget] = useState('G');
  const [edges, setEdges] = useState(graphEdges);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const steps = useMemo(() => dijkstraTimeline(graphNodes, edges, start, target), [edges, start, target]);
  const state = steps[Math.min(step, steps.length - 1)];

  // Draw the final route in order; the algorithm and graph remain usable without animation.
  useEffect(() => {
    if (!state.done || !state.path.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lines = stageRef.current?.querySelectorAll('.graph-edge.is-route line');
    if (!lines?.length) return;
    let cancelled = false;
    let animation;
    import('animejs').then(({ animate, stagger }) => {
      if (cancelled) return;
      animation = animate(lines, { opacity: { from: .18, to: 1 }, duration: 580, delay: stagger(115), ease: 'outQuad' });
    });
    return () => {
      cancelled = true;
      animation?.pause();
      lines.forEach(line => { line.style.opacity = ''; });
    };
  }, [state.done, state.path.join('')]);

  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setStep(previous => {
        if (previous >= steps.length - 1) {
          setPlaying(false);
          return previous;
        }
        return previous + 1;
      });
    }, 800);
    return () => window.clearInterval(timer);
  }, [playing, steps.length]);

  function changeRoute(nextStart, nextTarget) {
    setPlaying(false);
    setStep(0);
    setStart(nextStart);
    setTarget(nextTarget);
  }

  function toggleEdge(id) {
    setPlaying(false);
    setStep(0);
    setEdges(current => current.map(edge => edge.id === id ? { ...edge, enabled: !edge.enabled } : edge));
  }

  return (
    <div className="graph-console">
      <div className="graph-toolbar">
        <div className="graph-toolbar-label"><span className="live-dot" /> DIJKSTRA / INTERACTIVE</div>
        <div className="graph-selects">
          <label>起点
            <select value={start} onChange={event => changeRoute(event.target.value, target)}>
              {graphNodes.map(node => <option key={node.id} value={node.id}>{node.id}</option>)}
            </select>
          </label>
          <span aria-hidden="true">→</span>
          <label>终点
            <select value={target} onChange={event => changeRoute(start, event.target.value)}>
              {graphNodes.map(node => <option key={node.id} value={node.id}>{node.id}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="graph-layout">
        <div className="graph-stage-wrap">
          <div className="graph-stage" ref={stageRef} aria-label="带权无向图">
            <svg viewBox="0 0 720 440" preserveAspectRatio="none" role="img" aria-label="七个节点组成的带权图；边权可在图下方查看">
              {edges.map(edge => {
                const a = graphNodes.find(node => node.id === edge.a);
                const b = graphNodes.find(node => node.id === edge.b);
                const chosen = state.done && inPath(state.path, edge.a, edge.b);
                return (
                  <g key={edge.id} className={`graph-edge ${edge.enabled ? '' : 'is-disabled'} ${chosen ? 'is-route' : ''}`}>
                    <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                    <rect x={(a.x + b.x) / 2 - 16} y={(a.y + b.y) / 2 - 14} width="32" height="27" rx="7" />
                    <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 5} textAnchor="middle">{edge.weight}</text>
                  </g>
                );
              })}
            </svg>
            {graphNodes.map(node => {
              const selected = state.done && state.path.includes(node.id);
              return (
                <button
                  key={node.id}
                  className={`graph-node ${node.id === start ? 'is-start' : ''} ${node.id === target ? 'is-target' : ''} ${state.visited.includes(node.id) ? 'is-visited' : ''} ${state.current === node.id ? 'is-current' : ''} ${selected ? 'is-route' : ''}`}
                  style={{ left: `${node.x / 720 * 100}%`, top: `${node.y / 440 * 100}%` }}
                  onClick={() => changeRoute(start, node.id)}
                  type="button"
                  aria-label={`选择 ${node.id} 为终点`}
                  title={`点击设 ${node.id} 为终点`}
                >{node.id}</button>
              );
            })}
          </div>
          <p className="graph-hint">点击节点可设置终点；下方按钮显示边权，并可关闭或恢复任意边。</p>
          <div className="graph-edge-controls" role="group" aria-label="切换图中的边">
            {edges.map(edge => (
              <button
                key={edge.id}
                type="button"
                className={edge.enabled ? 'edge-chip is-active' : 'edge-chip'}
                aria-pressed={edge.enabled}
                onClick={() => toggleEdge(edge.id)}
              >{edge.id} <span>{edge.weight}</span></button>
            ))}
          </div>
        </div>

        <div className="graph-side">
          <div className="graph-side-top"><span>TRACE / {String(step).padStart(2, '0')}</span><span>{String(steps.length - 1).padStart(2, '0')} STEPS</span></div>
          <div className="graph-result">
            <span>SHORTEST PATH</span>
            <strong>{state.done ? (state.path.length ? state.path.join(' → ') : '不可达') : '计算中...'}</strong>
            <small>{state.done && state.path.length ? `总代价 ${state.distances[target]}` : `${start} → ${target}`}</small>
          </div>
          <p className="graph-message" aria-live="polite">{state.message}</p>
          <div className="graph-distances" aria-label="各节点当前的最短距离">
            {graphNodes.map(node => (
              <div key={node.id} className={state.current === node.id ? 'is-current' : ''}>
                <span>{node.id}</span>
                <strong>{Number.isFinite(state.distances[node.id]) ? state.distances[node.id] : '∞'}</strong>
              </div>
            ))}
          </div>
          <div className="graph-actions">
            <button type="button" className="action action-primary" onClick={() => {
              if (step === steps.length - 1) setStep(0);
              setPlaying(!playing);
            }}>{playing ? '暂停' : step === steps.length - 1 ? '重新播放' : '自动演示'} <span aria-hidden="true">{playing ? 'Ⅱ' : '↗'}</span></button>
            <button type="button" className="action" onClick={() => {
              setPlaying(false);
              setStep(current => Math.min(current + 1, steps.length - 1));
            }} disabled={step === steps.length - 1}>下一步 →</button>
            <button type="button" className="action action-quiet" onClick={() => {
              setPlaying(false);
              setStep(0);
              setEdges(graphEdges);
              setStart('A');
              setTarget('G');
            }}>重置</button>
          </div>
          <div className="graph-code"><span>// DIJKSTRA</span><code>pick min(dist) → relax(neighbors)</code></div>
        </div>
      </div>
    </div>
  );
}
