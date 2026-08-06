import React, { useEffect, useMemo, useRef, useState } from 'react';
import { soundManager } from '../utils/sound';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function BagArtwork({ bag }) {
  if (bag.img) {
    return <img src={bag.img} alt="" draggable="false" />;
  }

  return <span className="unbox-bag-icon" aria-hidden="true">{bag.icon || '🎁'}</span>;
}

export function UnboxingStage({ bag, count = 1, onComplete, onSkip }) {
  const [phase, setPhase] = useState('ready');
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const startXRef = useRef(0);
  const pointerIdRef = useRef(null);
  const completedRef = useRef(false);
  const resetTimerRef = useRef(null);
  const timersRef = useRef([]);

  const shards = useMemo(() => Array.from({ length: 22 }, (_, index) => ({
    id: index,
    angle: (360 / 22) * index + Math.random() * 14,
    distance: 90 + Math.random() * 155,
    delay: Math.random() * 110,
    size: 5 + Math.random() * 10
  })), []);

  useEffect(() => {
    const skipTimer = window.setTimeout(() => setCanSkip(true), 850);
    timersRef.current.push(skipTimer);

    if (count > 1) {
      const autoTimer = window.setTimeout(() => {
        beginTear();
      }, 1050);
      timersRef.current.push(autoTimer);
    }

    return () => {
      timersRef.current.forEach(window.clearTimeout);
      window.clearTimeout(resetTimerRef.current);
      soundManager.stopStretch();
    };
  }, []);

  const finishOnce = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    soundManager.stopStretch();
    onComplete();
  };

  const beginTear = () => {
    if (completedRef.current || phase === 'tearing' || phase === 'bursting') return;

    setProgress(100);
    setPhase('tearing');
    soundManager.stopStretch();
    soundManager.playRip();

    if (navigator.vibrate) {
      navigator.vibrate([20, 25, 42]);
    }

    const burstTimer = window.setTimeout(() => {
      setPhase('bursting');
      soundManager.playWhoosh();
    }, 420);

    const finishTimer = window.setTimeout(finishOnce, 1320);
    timersRef.current.push(burstTimer, finishTimer);
  };

  const handlePointerDown = (event) => {
    if (phase === 'tearing' || phase === 'bursting') return;

    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    setPhase('dragging');
    soundManager.playGrab();
  };

  const handlePointerMove = (event) => {
    if (phase !== 'dragging' || pointerIdRef.current !== event.pointerId) return;

    const viewportFactor = Math.min(230, Math.max(150, window.innerWidth * 0.46));
    const nextProgress = clamp(((event.clientX - startXRef.current) / viewportFactor) * 100, 0, 100);
    setProgress(nextProgress);
    soundManager.playStretch(nextProgress / 100);

    if (nextProgress >= 82) {
      beginTear();
    }
  };

  const handlePointerEnd = (event) => {
    if (pointerIdRef.current !== event.pointerId || phase !== 'dragging') return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    pointerIdRef.current = null;
    soundManager.stopStretch();

    if (progress >= 72) {
      beginTear();
      return;
    }

    setPhase('returning');
    setProgress(0);
    if (navigator.vibrate) navigator.vibrate(9);
    resetTimerRef.current = window.setTimeout(() => setPhase('ready'), 360);
  };

  const skip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    timersRef.current.forEach(window.clearTimeout);
    soundManager.stopStretch();
    onSkip();
  };

  const progressStyle = { '--tear-progress': `${progress}%` };

  return (
    <div className={`unbox-overlay unbox-phase-${phase}`} role="dialog" aria-modal="true" aria-label={`Đang xé ${bag.name}`}>
      <div className="unbox-backdrop-noise" />
      <div className="unbox-light-beam" />

      <div className="unbox-stage">
        <div className="unbox-copy">
          <span className="unbox-kicker">LƯỢT MỞ {count > 1 ? `×${count}` : 'ĐẶC BIỆT'}</span>
          <h2>{bag.name}</h2>
          <p>{count > 1 ? 'Tự động xé nhiều túi và gom kết quả trong một lần.' : 'Giữ phần mép sáng rồi kéo mạnh sang phải để xé.'}</p>
        </div>

        <div className={`unbox-bag-scene ${phase}`} style={progressStyle}>
          <div className="unbox-aura unbox-aura-one" />
          <div className="unbox-aura unbox-aura-two" />
          <div className="unbox-inner-glow" />

          <div className="unbox-fragment unbox-fragment-top">
            <BagArtwork bag={bag} />
          </div>
          <div className="unbox-fragment unbox-fragment-bottom">
            <BagArtwork bag={bag} />
          </div>

          <svg className="unbox-tear-line" viewBox="0 0 320 48" preserveAspectRatio="none" aria-hidden="true">
            <path d="M0 25 L24 20 L41 29 L63 18 L82 27 L105 17 L126 28 L151 19 L172 30 L197 18 L219 27 L244 17 L263 28 L286 18 L320 24" />
          </svg>

          <div className="unbox-burst-core" />

          {shards.map((shard) => (
            <span
              key={shard.id}
              className="unbox-shard"
              style={{
                '--shard-angle': `${shard.angle}deg`,
                '--shard-distance': `${shard.distance}px`,
                '--shard-delay': `${shard.delay}ms`,
                '--shard-size': `${shard.size}px`
              }}
            />
          ))}

          <button
            type="button"
            className="unbox-pull-tab"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            disabled={phase === 'tearing' || phase === 'bursting' || count > 1}
            aria-label="Giữ và kéo sang phải để xé túi"
          >
            <span className="unbox-grip-lines" />
            <span className="unbox-pull-label">KÉO</span>
          </button>
        </div>

        <div className="unbox-progress-wrap" aria-hidden="true">
          <div className="unbox-progress-track">
            <div className="unbox-progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{phase === 'bursting' ? 'Đang hé lộ vật phẩm…' : `${Math.round(progress)}%`}</span>
        </div>

        <div className="unbox-actions">
          {count === 1 && phase !== 'tearing' && phase !== 'bursting' && (
            <button type="button" className="unbox-auto-button" onClick={beginTear}>
              Xé tự động
            </button>
          )}
          {canSkip && (
            <button type="button" className="unbox-skip-button" onClick={skip}>
              Bỏ qua
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
