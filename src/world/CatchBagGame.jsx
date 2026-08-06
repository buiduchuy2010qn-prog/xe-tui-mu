import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PackageVisual } from '../components/PackageVisual';
import { BAGS } from '../data/bags';
import { soundManager } from '../utils/sound';
import { Icon } from './Icon';
import { formatNumber } from './gameLogic';

const GAME_SECONDS = 30;
const STARTING_LIVES = 3;

function randomCatchable(elapsedRatio) {
  const roll = Math.random();
  if (roll < 0.035 + elapsedRatio * 0.02) return { kind: 'bomb', icon: '✹', value: 0, label: 'Bom' };
  if (roll < 0.085 + elapsedRatio * 0.025) return { kind: 'trash', icon: '☠', value: 0, label: 'Túi rác' };
  if (roll < 0.12) return { kind: 'Legendary', value: 120, label: 'Huyền thoại' };
  if (roll < 0.23) return { kind: 'Epic', value: 55, label: 'Sử thi' };
  if (roll < 0.48) return { kind: 'Rare', value: 25, label: 'Hiếm' };
  return { kind: 'Common', value: 10, label: 'Thường' };
}

function makeFallingBag(id, elapsedRatio) {
  const catchable = randomCatchable(elapsedRatio);
  const availableBags = BAGS.filter((bag) => bag.minLevel <= 8);
  const bag = availableBags[Math.floor(Math.random() * availableBags.length)] || BAGS[0];
  return {
    id,
    ...catchable,
    bag,
    x: 6 + Math.random() * 88,
    y: -14 - Math.random() * 12,
    speed: 16 + Math.random() * 10 + elapsedRatio * 12,
    sway: Math.random() * 2 - 1,
    rotation: Math.random() * 24 - 12
  };
}

export function CatchBagGame({ playsLeft, onFinish, onClose }) {
  const [phase, setPhase] = useState('intro');
  const [entities, setEntities] = useState([]);
  const [basketX, setBasketX] = useState(50);
  const [seconds, setSeconds] = useState(GAME_SECONDS);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [caught, setCaught] = useState(0);
  const [floatingTexts, setFloatingTexts] = useState([]);

  const arenaRef = useRef(null);
  const entitiesRef = useRef([]);
  const basketXRef = useRef(50);
  const scoreRef = useRef(0);
  const livesRef = useRef(STARTING_LIVES);
  const comboRef = useRef(0);
  const bestComboRef = useRef(0);
  const caughtRef = useRef(0);
  const startedAtRef = useRef(0);
  const spawnAtRef = useRef(0);
  const frameRef = useRef(null);
  const finishedRef = useRef(false);
  const nextIdRef = useRef(1);

  const decorativeBags = useMemo(() => BAGS.slice(0, 5), []);

  const showFloat = (text, x, kind) => {
    const id = `${Date.now()}-${Math.random()}`;
    setFloatingTexts((current) => [...current, { id, text, x, kind }]);
    window.setTimeout(() => setFloatingTexts((current) => current.filter((entry) => entry.id !== id)), 900);
  };

  const finishGame = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    window.cancelAnimationFrame(frameRef.current);
    setPhase('result');
    const reward = Math.max(0, Math.min(800, Math.round(scoreRef.current)));
    onFinish({
      coins: reward,
      caught: caughtRef.current,
      bestCombo: bestComboRef.current,
      lives: livesRef.current
    });
  };

  const catchEntity = (entity) => {
    if (entity.kind === 'bomb') {
      livesRef.current = Math.max(0, livesRef.current - 1);
      comboRef.current = 0;
      setLives(livesRef.current);
      setCombo(0);
      showFloat('-1 MẠNG', entity.x, 'bad');
      soundManager.playRip('foil');
      if (navigator.vibrate) navigator.vibrate([55, 35, 80]);
      if (livesRef.current <= 0) finishGame();
      return;
    }

    if (entity.kind === 'trash') {
      comboRef.current = 0;
      scoreRef.current = Math.max(0, scoreRef.current - 15);
      setCombo(0);
      setScore(scoreRef.current);
      showFloat('-15 XU', entity.x, 'bad');
      soundManager.playGrab();
      if (navigator.vibrate) navigator.vibrate(25);
      return;
    }

    comboRef.current += 1;
    bestComboRef.current = Math.max(bestComboRef.current, comboRef.current);
    caughtRef.current += 1;
    const multiplier = Math.min(2.5, 1 + Math.floor(comboRef.current / 5) * 0.25);
    const gained = Math.round(entity.value * multiplier);
    scoreRef.current += gained;

    setCombo(comboRef.current);
    setBestCombo(bestComboRef.current);
    setCaught(caughtRef.current);
    setScore(scoreRef.current);
    showFloat(`+${gained}`, entity.x, entity.kind.toLowerCase());

    if (entity.kind === 'Legendary') soundManager.playLegendary();
    else if (entity.kind === 'Epic' || entity.kind === 'Rare') soundManager.playRare();
    else soundManager.playCoin();
    if (navigator.vibrate) navigator.vibrate(entity.kind === 'Legendary' ? [20, 20, 45] : 12);
  };

  const update = (time) => {
    if (finishedRef.current) return;
    const elapsed = (time - startedAtRef.current) / 1000;
    const elapsedRatio = Math.min(1, elapsed / GAME_SECONDS);
    const remaining = Math.max(0, GAME_SECONDS - elapsed);
    setSeconds(Math.ceil(remaining));

    const spawnDelay = 610 - elapsedRatio * 220;
    if (time - spawnAtRef.current >= spawnDelay) {
      spawnAtRef.current = time;
      entitiesRef.current = [...entitiesRef.current, makeFallingBag(nextIdRef.current++, elapsedRatio)];
    }

    const delta = 1 / 60;
    const nextEntities = [];
    for (const entity of entitiesRef.current) {
      const next = {
        ...entity,
        y: entity.y + entity.speed * delta,
        x: Math.max(3, Math.min(97, entity.x + entity.sway * delta * 4)),
        rotation: entity.rotation + entity.sway * 0.45
      };

      const nearBasket = next.y >= 78 && next.y <= 94 && Math.abs(next.x - basketXRef.current) <= 11;
      if (nearBasket) {
        catchEntity(next);
        continue;
      }
      if (next.y > 108) {
        if (!['bomb', 'trash'].includes(next.kind)) {
          comboRef.current = 0;
          setCombo(0);
        }
        continue;
      }
      nextEntities.push(next);
    }
    entitiesRef.current = nextEntities;
    setEntities(nextEntities);

    if (remaining <= 0 || livesRef.current <= 0) {
      finishGame();
      return;
    }
    frameRef.current = window.requestAnimationFrame(update);
  };

  const startGame = () => {
    finishedRef.current = false;
    entitiesRef.current = [];
    scoreRef.current = 0;
    livesRef.current = STARTING_LIVES;
    comboRef.current = 0;
    bestComboRef.current = 0;
    caughtRef.current = 0;
    nextIdRef.current = 1;
    setEntities([]);
    setScore(0);
    setLives(STARTING_LIVES);
    setCombo(0);
    setBestCombo(0);
    setCaught(0);
    setSeconds(GAME_SECONDS);
    setPhase('playing');
    const now = performance.now();
    startedAtRef.current = now;
    spawnAtRef.current = now - 500;
    frameRef.current = window.requestAnimationFrame(update);
  };

  useEffect(() => () => window.cancelAnimationFrame(frameRef.current), []);

  const moveBasket = (clientX) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    const next = Math.max(8, Math.min(92, ((clientX - rect.left) / rect.width) * 100));
    basketXRef.current = next;
    setBasketX(next);
  };

  const pointerMove = (event) => {
    if (phase !== 'playing') return;
    moveBasket(event.clientX);
  };

  return (
    <div className="catch-game-overlay" role="dialog" aria-modal="true" aria-label="Game bắt túi mù">
      <div className="catch-game-shell">
        <header className="catch-game-header">
          <div><span>MINI-GAME KIẾM XU</span><h2>Bắt Túi Mù Rơi</h2></div>
          {phase !== 'playing' && <button type="button" onClick={onClose}><Icon name="close" /></button>}
        </header>

        <div
          ref={arenaRef}
          className={`catch-arena phase-${phase}`}
          onPointerDown={(event) => moveBasket(event.clientX)}
          onPointerMove={pointerMove}
        >
          <div className="catch-sky"><i /><i /><i /></div>

          {phase === 'intro' && (
            <div className="catch-intro">
              <div className="catch-intro-packs">{decorativeBags.map((bag, index) => <PackageVisual key={bag.id} bag={bag} compact className={`intro-pack intro-pack-${index}`} />)}</div>
              <span>LƯỢT CÒN LẠI HÔM NAY: {playsLeft}</span>
              <h3>Kéo giỏ và bắt càng nhiều túi mù càng tốt</h3>
              <p>30 giây · 3 mạng · combo càng cao thì số xu nhận được càng lớn.</p>
              <div className="catch-rules"><b><i className="rule-bag" /> Túi màu: +xu</b><b><i className="rule-trash">☠</i> Túi rác: -15 xu</b><b><i className="rule-bomb">✹</i> Bom: -1 mạng</b></div>
              <button type="button" onClick={startGame} disabled={playsLeft <= 0}>{playsLeft > 0 ? 'Bắt đầu chơi' : 'Đã hết lượt hôm nay'}</button>
            </div>
          )}

          {phase === 'playing' && (
            <>
              <div className="catch-hud">
                <div><small>THỜI GIAN</small><strong>{seconds}s</strong></div>
                <div><small>XU ĐÃ BẮT</small><strong>{formatNumber(score)}</strong></div>
                <div><small>COMBO</small><strong>×{combo}</strong></div>
                <div><small>MẠNG</small><strong>{'♥'.repeat(lives)}{'♡'.repeat(STARTING_LIVES - lives)}</strong></div>
              </div>

              {entities.map((entity) => (
                <div
                  key={entity.id}
                  className={`falling-catchable catch-${entity.kind.toLowerCase()}`}
                  style={{ left: `${entity.x}%`, top: `${entity.y}%`, transform: `translate(-50%, -50%) rotate(${entity.rotation}deg)` }}
                >
                  {entity.kind === 'bomb' || entity.kind === 'trash'
                    ? <span className="hazard-icon">{entity.icon}</span>
                    : <PackageVisual bag={entity.bag} compact />}
                  <small>{entity.kind === 'bomb' ? 'BOM' : entity.kind === 'trash' ? '-15' : `+${entity.value}`}</small>
                </div>
              ))}

              {floatingTexts.map((entry) => <span key={entry.id} className={`catch-float catch-float-${entry.kind}`} style={{ left: `${entry.x}%` }}>{entry.text}</span>)}

              <div className="catch-basket" style={{ left: `${basketX}%` }}>
                <div className="basket-glow" /><div className="basket-rim" /><div className="basket-body"><span>WORLD PACK</span></div>
              </div>
              <div className="catch-drag-hint">Giữ và kéo giỏ sang trái hoặc phải</div>
            </>
          )}

          {phase === 'result' && (
            <div className="catch-result">
              <span>HOÀN THÀNH</span>
              <h3>Nhận {formatNumber(score)} xu</h3>
              <p>Bắt được <b>{caught}</b> túi · Combo cao nhất <b>×{bestCombo}</b></p>
              <div className="catch-result-coins"><Icon name="coin" size={36} /><strong>+{formatNumber(score)}</strong></div>
              <button type="button" onClick={onClose}>Nhận xu và quay lại</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
