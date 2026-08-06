import React, { useEffect, useMemo, useRef, useState } from 'react';
import { soundManager } from '../utils/sound';
import './UnboxingStage.css';

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
  const phaseRef = useRef('ready');
  const progressRef = useRef(0);
  const resetTimerRef = useRef(null);
  const timersRef = useRef([]);

  const changePhase = (nextPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  };

  const changeProgress = (nextProgress) => {
    progressRef.current = nextProgress;
    setProgress(nextProgress);
  };

  const shards = useMemo(() => Array.from({ length: 22 }, (_, index) => ({
    id: index,
    angle: (360 / 22) * index + Math.random() * 14,
    distance: 90 + Math.random() * 155,
    delay: Math.random() * 110,
    size: 5 + Math.random() * 10
  })), []);

  const finishOnce = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    soundManager.stopStretch();
    onComplete();
  };

  const beginTear = () => {
    if (completedRef.current || ['tearing', 'bursting'].includes(phaseRef.current)) return;

    changeProgress(100);
    changePhase('tearing');
    soundManager.stopStretch();
    soundManager.playRip();

    if (navigator.vibrate) {
      navigator.vibrate([20, 25, 42]);
    }

    const burstTimer = window.setTimeout(() => {
      changePhase('bursting');
      soundManager.playWhoosh();
    }, 420);

    const finishTimer = window.setTimeout(finishOnce, 1320);
    timersRef.current.push(burstTimer, finishTimer);
  };

  useEffect(() => {
    const skipTimer = window.setTimeout(() => setCanSkip(true), 850);
    timersRef.current.push(skipTimer);

    if (count > 1) {
      const autoTimer = window.setTimeout(beginTear, 1050);
      timersRef.current.push(autoTimer);
    }

    return () => {
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(resetTimerRef.current);
      soundManager.stopStretch();
    };
  }, []);

  const handlePointerDown = (event) => {
    if (['tearing', 'bursting'].includes(phaseRef.current)) return;

    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    event.currentTarget.setPointerCapture?.(event.pointerId);
    changePhase('dragging');
    soundManager.playGrab();
  };

  const handlePointerMove = (event) => {
    if (phaseRef.current !== 'dragging' || pointerIdRef.current !== event.pointerId) return;

    const viewportFactor = Math.min(230, Math.max(150, window.innerWidth * 0.46));
    const nextProgress = clamp(((event.clientX - startXRef.current) / viewportFactor) * 100, 0, 100);
    changeProgress(nextProgress);
    soundManager.playStretch(nextProgress / 100);

    if (nextProgress >= 82) beginTear();
  };

  const handlePointerEnd = (event) => {
    if (pointerIdRef.current !== event.pointerId || phaseRef.current !== 'dragging') return;

    event.currentTarget.releasePointerCapture?.(event.pointerId);
    pointerIdRef.current = null;
    soundManager.stopStretch();

    if (progressRef.current >= 72) {
      beginTear();
      return;
    }

    changePhase('returning');
    changeProgress(0);
    if (navigator.vibrate) navigator.vibrate(9);
    resetTimerRef.current = window.setTimeout(() => changePhase('ready'), 360);
  };

  const skip = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    timersRef.current.forEach((timer) => window.clearTimeout(timer));
    soundManager.stopStretch();
    onSkip();
  };

  const normalizedProgress = progress / 100;
  const progressStyle = {
    '--tear-progress': `${progress}%`,
    '--tear-opacity': Math.min(0.92, normalizedProgress * 0.84),
    '--tear-scale': 0.45 + normalizedProgress * 0.84,
    '--tear-top-x': `${progress * 0.08}px`,
    '--tear-top-rotation': `${progress * -0.025}deg`,
    '--tear-brightness': 1 + progress / 260,
    '--tear-bottom-x': `${progress * -0.025}px`,
    '--tear-dash-offset': 360 - progress * 3.6,
    '--tear-tab-left': `${-4 + progress * 0.9}%`,
    '--tear-tab-rotation': `${progress * 0.04}deg`
  };

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
