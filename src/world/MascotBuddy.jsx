import React, { useEffect, useMemo, useState } from 'react';
import './MascotBuddy.css';

const LINES = {
  idle: ['Xé thêm đi nè~', 'Cà chua may mắn đang ở đây!', 'Biết đâu túi sau ra đồ xịn đó!'],
  tearing: ['Kéo mạnh tay lên!', 'Sắp rách rồi đó!', 'Đừng nhấc tay giữa chừng nha!'],
  common: ['Đồ thường nhưng vô tri dữ!', 'Lượt sau chắc đỏ hơn á!', 'Cất vào kho rồi xé tiếp thôi~'],
  rare: ['Ui, đồ hiếm kìa!', 'Cà chua phù hộ rồi nha!', 'Đỏ thiệt rồi đó!'],
  legendary: ['HUYỀN THOẠI!!!', 'Trúng lớn rồi, nhảy thôi!', 'Hôm nay đỏ quá trời!'],
  game: ['Ca làm bắt túi bắt đầu!', 'Kéo giỏ nhanh lên!', 'Giữ combo, né bom nha!'],
  coin: ['Kiếm xu để xé tiếp nè!', 'Nhặt xu chăm chỉ nào!', 'Có xu rồi, mở túi thôi!']
};

function detectMood() {
  const reveal = document.querySelector('.reveal-overlay');
  if (reveal) {
    if (reveal.classList.contains('rarity-theme-legendary')) return 'legendary';
    if (reveal.classList.contains('rarity-theme-epic') || reveal.classList.contains('rarity-theme-rare')) return 'rare';
    return 'common';
  }
  if (document.querySelector('.tear-overlay')) return 'tearing';
  if (document.querySelector('.catch-game-overlay')) return 'game';
  if (document.querySelector('.earn-panel')) return 'coin';
  return 'idle';
}

function pickLine(mood, current) {
  const pool = LINES[mood] || LINES.idle;
  const choices = pool.filter((line) => line !== current);
  return choices[Math.floor(Math.random() * choices.length)] || pool[0];
}

export function MascotBuddy() {
  const [mood, setMood] = useState('idle');
  const [line, setLine] = useState(LINES.idle[0]);
  const [burst, setBurst] = useState(0);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    const refresh = () => {
      const next = detectMood();
      setMood((previous) => {
        if (previous !== next) {
          setLine((current) => pickLine(next, current));
          if (['rare', 'legendary', 'coin'].includes(next)) setBurst((value) => value + 1);
        }
        return next;
      });
    };

    refresh();
    const observer = new MutationObserver(refresh);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });

    const click = (event) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('.primary-open-button')) {
        setMood('tearing');
        setLine((current) => pickLine('tearing', current));
      } else if (event.target.closest('.earn-nav, .earn-coin-button, .earn-ribbon button')) {
        setMood('coin');
        setLine((current) => pickLine('coin', current));
      }
    };
    document.addEventListener('click', click, true);

    const timer = window.setInterval(() => {
      if (detectMood() === 'idle') {
        setLine((current) => pickLine('idle', current));
        setBurst((value) => value + 1);
      }
    }, 7200);

    return () => {
      observer.disconnect();
      document.removeEventListener('click', click, true);
      window.clearInterval(timer);
    };
  }, []);

  const sparkles = useMemo(() => Array.from({ length: 9 }, (_, index) => ({
    id: `${burst}-${index}`,
    angle: index * 40,
    distance: 42 + (index % 3) * 13,
    delay: (index % 4) * 0.035
  })), [burst]);

  const interact = () => {
    setLine((current) => pickLine(mood, current));
    setBurst((value) => value + 1);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  if (minimized) {
    return (
      <button className="mascot-mini" type="button" onClick={() => setMinimized(false)} aria-label="Mở Chiikawa cà chua">
        <img src="/assets/mascots/chiikawa-tomato.webp" alt="Chiikawa đội cà chua" />
        <span>!</span>
      </button>
    );
  }

  return (
    <aside className={`mascot-buddy mood-${mood}`} aria-live="polite">
      <button className="mascot-minimize" type="button" onClick={() => setMinimized(true)} aria-label="Thu nhỏ nhân vật">−</button>
      <div className="mascot-speech">
        <strong>{mood === 'game' ? 'CA LÀM VÔ TRI' : mood === 'legendary' ? 'SIÊU ĐỎ!' : 'BÉ CÀ CHUA'}</strong>
        <span>{line}</span>
      </div>
      <button className="mascot-character" type="button" onClick={interact} aria-label="Chạm vào Chiikawa">
        <span className="mascot-halo" />
        <img src="/assets/mascots/chiikawa-tomato.webp" alt="Chiikawa đội cà chua trong game" />
        <span className="mascot-tomato" aria-hidden="true"><i /><i /><b /><b /><em /></span>
        <span className="mascot-shadow" />
      </button>
      <div className="mascot-sparkles" key={burst} aria-hidden="true">
        {sparkles.map((spark) => <i key={spark.id} style={{ '--spark-angle': `${spark.angle}deg`, '--spark-distance': `${spark.distance}px`, '--spark-delay': `${spark.delay}s` }}>{spark.angle % 80 === 0 ? '♥' : '✦'}</i>)}
      </div>
    </aside>
  );
}
