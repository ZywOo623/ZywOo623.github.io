import { useEffect, useState } from 'react';

const views = [
  { label: '训练概览', short: 'OVERVIEW' },
  { label: '错题复盘', short: 'REVIEW' },
  { label: '薄弱点分析', short: 'INSIGHTS' },
];

export default function TrackerPreview() {
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Cycle through the real product areas until the visitor chooses one.
  useEffect(() => {
    if (manual || hovered || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setInterval(() => setActive(current => (current + 1) % views.length), 4600);
    return () => window.clearInterval(timer);
  }, [manual, hovered]);

  return (
    <div className="tracker-preview" aria-label="Algorithm Tracker 功能预览" onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}>
      <div className="tracker-preview-chrome"><span className="tracker-preview-dots" aria-hidden="true"><i /><i /><i /></span><span>ALGORITHM TRACKER</span><span>↗</span></div>
      <div className="tracker-preview-tabs" role="group" aria-label="切换预览内容">
        {views.map((view, index) => <button key={view.short} type="button" aria-pressed={active === index} onClick={() => { setActive(index); setManual(true); }}>{view.label}</button>)}
      </div>
      <div className="tracker-preview-screen" key={active}>
        {active === 0 && <div className="tracker-preview-view">
          <span className="tracker-preview-eyebrow">01 / CODEFORCES</span>
          <strong>训练概览</strong>
          <div className="tracker-preview-input"><span>账号同步与提交记录</span><b>SYNC ↗</b></div>
          <div className="tracker-preview-metrics"><div><span>已尝试</span><i aria-hidden="true" /></div><div><span>已解决</span><i aria-hidden="true" /></div><div><span>待攻克</span><i aria-hidden="true" /></div></div>
        </div>}
        {active === 1 && <div className="tracker-preview-view">
          <span className="tracker-preview-eyebrow">02 / REVIEW LOOP</span>
          <strong>错题中心</strong>
          <div className="tracker-preview-row"><span className="tracker-preview-badge">记录</span><span>留下错误尝试</span><b>01</b></div>
          <div className="tracker-preview-row"><span className="tracker-preview-badge">复习</span><span>回顾解题思路</span><b>02</b></div>
          <div className="tracker-preview-row"><span className="tracker-preview-badge is-done">掌握</span><span>更新学习状态</span><b>03</b></div>
        </div>}
        {active === 2 && <div className="tracker-preview-view">
          <span className="tracker-preview-eyebrow">03 / NEXT STEP</span>
          <strong>薄弱点分析</strong>
          <div className="tracker-preview-insight"><span>最近 50 题</span><b>标签统计</b><i aria-hidden="true" /></div>
          <div className="tracker-preview-insight"><span>训练重点</span><b>本周计划</b><i aria-hidden="true" /></div>
          <div className="tracker-preview-insight"><span>CF 题库</span><b>推荐未做题</b><i aria-hidden="true" /></div>
        </div>}
      </div>
      <div className="tracker-preview-foot"><span>交互式功能示意 · 无真实训练数据</span><span>{String(active + 1).padStart(2, '0')} / 03</span></div>
    </div>
  );
}
