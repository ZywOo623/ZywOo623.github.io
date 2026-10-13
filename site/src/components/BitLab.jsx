import { useState } from 'react';

export default function BitLab() {
  const [value, setValue] = useState(180);
  const bits = value.toString(2).padStart(8, '0');
  const lowbit = value & -value;
  const count = bits.replaceAll('0', '').length;

  return (
    <div className="bit-console">
      <div className="bit-left">
        <div className="console-top"><span><span className="live-dot" /> BIT_EXPLORER.EXE</span><span>8-BIT / UNSIGNED</span></div>
        <div className="bit-labels" aria-hidden="true">{[7, 6, 5, 4, 3, 2, 1, 0].map(bit => <span key={bit}>{bit}</span>)}</div>
        <div className="bit-buttons" role="group" aria-label="切换八个二进制位">
          {[7, 6, 5, 4, 3, 2, 1, 0].map(bit => {
            const on = Boolean(value & (1 << bit));
            return <button key={bit} type="button" className={`bit-button ${on ? 'is-on' : ''} ${on && lowbit === 1 << bit ? 'is-lowbit' : ''}`} aria-label={`第 ${bit} 位，当前为 ${on ? 1 : 0}`} aria-pressed={on} onClick={() => setValue(current => current ^ (1 << bit))}>{on ? 1 : 0}</button>;
          })}
        </div>
        <div className="binary-readout"><span>BINARY</span><strong>{bits.slice(0, 4)} {bits.slice(4)}</strong></div>
        <div className="bit-actions">
          <button type="button" className="action action-primary" onClick={() => setValue(Math.floor(Math.random() * 256))}>SHUFFLE ↗</button>
          <button type="button" className="action" onClick={() => setValue(180)}>RESET ↺</button>
          <span>CLICK A BIT TO TOGGLE</span>
        </div>
      </div>
      <div className="bit-results" aria-live="polite">
        <div><span>DECIMAL <small>BASE 10</small></span><strong>{value}</strong></div>
        <div><span>HEX <small>BASE 16</small></span><strong>0x{value.toString(16).toUpperCase().padStart(2, '0')}</strong></div>
        <div><span>POPCOUNT <small>SET BITS</small></span><strong>{count}</strong></div>
        <div><span>LOWBIT <small>N &amp; -N</small></span><strong>{lowbit}</strong></div>
        <a href="/blog/0x01-bit-operation/">从原理到代码：读 0x01 位运算 <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  );
}
