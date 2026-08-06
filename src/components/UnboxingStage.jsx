import React, { useEffect, useMemo, useRef, useState } from 'react';
import { soundManager } from '../utils/sound';
import './UnboxingStage.css';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function Artwork({ bag }) {
  if (bag.img) return <img src={bag.img} alt="" draggable="false" />;
  return <span className="tear-bag-fallback" aria-hidden="true">{bag.icon || '◆'}</span>;
}

export function UnboxingStage({ bag, count = 1, onComplete }) {
  const [phase, setPhase] = useState('ready');
  const [progress, setProgress] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const phaseRef = useRef('ready');
  const progressRef = useRef(0);
  const startXRef = useRef(0);
  const pointerRef = useRef(null);
  const doneRef = useRef(false);
  const timersRef = useRef([]);

  const fragments = useMemo(() => Array.from({ length: 34 }, (_, index) => ({
    id: index,
    angle: -150 + Math.random() * 300,
    distance: 100 + Math.random() * 250,
    delay: Math.random() * 0.2,
    size: 4 + Math.random() * 10,
    rotate: Math.random() * 300 - 150
  })), []);

  const setTearPhase = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const setTearProgress = (next) => {
    progressRef.current = next;
    setProgress(next);
  };

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    soundManager.stopStretch();
    onComplete();
  };

  const tearOpen = () => {
    if (doneRef.current || ['tearing', 'bursting'].includes(phaseRef.current)) return;
    setShowHint(false);
    setTearProgress(100);
    setTearPhase('tearing');
    soundManager.stopStretch();
    soundManager.playRip(bag.material || 'plastic');
    if (navigator.vibrate) navigator.vibrate([18, 20, 35, 20, 55]);

    const burstTimer = window.setTimeout(() => {
      setTearPhase('bursting');
      soundManager.playWhoosh();
    }, 520);
    const finishTimer = window.setTimeout(finish, 1650);
    timersRef.current.push(burstTimer, finishTimer);
  };

  useEffect(() => {
    const hintTimer = window.setTimeout(() => setShowHint(true), 4800);
    timersRef.current.push(hintTimer);
    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      soundManager.stopStretch();
    };
  }, []);

  const onPointerDown = (event) => {
    if (!['ready', 'returning'].includes(phaseRef.current)) return;
    pointerRef.current = event.pointerId;
    startXRef.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setShowHint(false);
    setTearPhase('dragging');
    soundManager.playGrab();
    if (navigator.vibrate) navigator.vibrate(8);
  };

  const onPointerMove = (event) => {
    if (phaseRef.current !== 'dragging' || pointerRef.current !== event.pointerId) return;
    const travel = Math.min(330, Math.max(190, window.innerWidth * 0.67));
    const next = clamp(((event.clientX - startXRef.current) / travel) * 100, 0, 100);
    setTearProgress(next);
    soundManager.playStretch(next / 100);
    if (next >= 88) tearOpen();
  };

  const releasePointer = (event) => {
    if (pointerRef.current !== event.pointerId || phaseRef.current !== 'dragging') return;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
    pointerRef.current = null;
    soundManager.stopStretch();

    if (progressRef.current >= 76) {
      tearOpen();
      return;
    }

    setTearPhase('returning');
    setTearProgress(0);
    if (navigator.vibrate) navigator.vibrate(10);
    const timer = window.setTimeout(() => setTearPhase('ready'), 430);
    timersRef.current.push(timer);
  };

  const keyboardTear = (event) => {
    if (!['Enter', ' '].includes(event.key) || !['ready', 'returning'].includes(phaseRef.current)) return;
    event.preventDefault();
    setTearPhase('dragging');
    let value = 0;
    const timer = window.setInterval(() => {
      value += 5;
      setTearProgress(value);
      soundManager.playStretch(value / 100);
      if (value >= 90) {
        window.clearInterval(timer);
        tearOpen();
      }
    }, 28);
    timersRef.current.push(timer);
  };

  const normalized = progress / 100;
  const stageStyle = {
    '--tear-progress': progress,
    '--tear-x': `${progress * 0.91}%`,
    '--tear-top-shift': `${progress * 0.11}px`,
    '--tear-bottom-shift': `${progress * -0.035}px`,
    '--tear-gap': `${Math.max(0, progress - 42) * 0.075}px`,
    '--tear-glow': Math.min(1, normalized * 1.3),
    '--tear-tilt': `${progress * -0.035}deg`,
    '--tear-dash': 520 - progress * 5.2,
    '--bag-accent': bag.borderColor || '#f5b942'
  };

  return (
    <div className={`tear-overlay phase-${phase}`} role="dialog" aria-modal="true" aria-label={`Xé ${bag.name}`}>
      <div className="tear-backdrop" />
      <div className="tear-beam tear-beam-left" />
      <div className="tear-beam tear-beam-right" />

      <div className="tear-layout">
        <header className="tear-heading">
          <span>ĐANG CẦM {count > 1 ? `${count} TÚI` : '1 TÚI'}</span>
          <h2>{bag.name}</h2>
          <p>Giữ tay kéo ở mép trái, sau đó kéo dứt khoát hết sang phải.</p>
        </header>

        <div className="tear-scene" style={stageStyle}>
          <div className="tear-aura" />
          <div className="tear-floor" />
          <div className="tear-flash" />

          <div className="tear-bag tear-bag-top"><Artwork bag={bag} /><span className="tear-surface" /></div>
          <div className="tear-bag tear-bag-bottom"><Artwork bag={bag} /><span className="tear-surface" /></div>

          <svg className="tear-path" viewBox="0 0 520 66" preserveAspectRatio="none" aria-hidden="true">
            <path d="M2 34 L32 25 L58 39 L84 22 L113 36 L143 24 L170 40 L201 21 L230 38 L260 24 L291 41 L322 22 L354 37 L386 23 L416 40 L448 24 L478 37 L518 29" />
          </svg>

          <button
            type="button"
            className="tear-handle"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={releasePointer}
            onPointerCancel={releasePointer}
            onKeyDown={keyboardTear}
            disabled={['tearing', 'bursting'].includes(phase)}
            aria-label="Giữ và kéo sang phải để xé túi"
          >
            <i /><i /><i /><span>KÉO</span>
          </button>

          <div className={`tear-hand-guide ${phase === 'ready' ? 'visible' : ''}`}><span>☝</span></div>
          {fragments.map((fragment) => (
            <i
              className="tear-fragment"
              key={fragment.id}
              style={{
                '--fragment-angle': `${fragment.angle}deg`,
                '--fragment-distance': `${fragment.distance}px`,
                '--fragment-delay': `${fragment.delay}s`,
                '--fragment-size': `${fragment.size}px`,
                '--fragment-rotate': `${fragment.rotate}deg`
              }}
            />
          ))}
        </div>

        <div className="tear-meter">
          <div><i style={{ width: `${progress}%` }} /></div>
          <span>{phase === 'bursting' ? 'TÚI ĐÃ BUNG' : phase === 'tearing' ? 'ĐANG RÁCH...' : `${Math.round(progress)}%`}</span>
        </div>

        <div className="tear-instruction">
          <span className="tear-pulse" />
          <strong>{phase === 'returning' ? 'Chưa đủ lực — thử kéo lại' : phase === 'bursting' ? 'Đang hé lộ vật phẩm...' : 'Giữ và kéo liên tục, đừng nhấc tay giữa chừng'}</strong>
        </div>
        {showHint && <p className="tear-hint">Hãy đặt ngón tay lên nút <b>KÉO</b> ở mép trái của túi.</p>}
      </div>
    </div>
  );
}
