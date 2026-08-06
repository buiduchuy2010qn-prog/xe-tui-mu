import React, { useEffect, useMemo, useState } from 'react';
import { ITEM_RARITIES } from '../data/items';
import { soundManager } from '../utils/sound';
import { RARITY_ORDER } from './gameLogic';

export function ItemVisual({ item, large = false }) {
  return (
    <div className={`item-visual ${large ? 'item-visual-large' : ''}`}>
      {item.img ? <img src={item.img} alt={item.name} /> : <span>{item.icon}</span>}
    </div>
  );
}

export function RevealStage({ bundle, particlesEnabled, onClose, onOpenAgain, onInventory }) {
  const [ready, setReady] = useState(false);
  const best = bundle.results.reduce((current, result) => (
    RARITY_ORDER[result.item.rarity] > RARITY_ORDER[current.item.rarity] ? result : current
  ), bundle.results[0]);
  const rarity = ITEM_RARITIES[best.item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;
  const sparks = useMemo(() => Array.from({ length: particlesEnabled ? 60 : 0 }, (_, index) => ({
    id: index,
    x: Math.random() * 100,
    delay: Math.random() * 1.1,
    duration: 1.4 + Math.random() * 1.8,
    size: 3 + Math.random() * 7
  })), [particlesEnabled]);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), 120);
    if (best.item.rarity === 'Legendary') soundManager.playLegendary();
    else if (['Epic', 'Rare'].includes(best.item.rarity)) soundManager.playRare();
    else soundManager.playPop();
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className={`reveal-overlay rarity-theme-${best.item.rarity.toLowerCase()} ${ready ? 'ready' : ''}`} style={{ '--rarity-color': rarity.border }}>
      <div className="reveal-radiance" />
      {sparks.map((spark) => <i key={spark.id} className="reveal-spark" style={{ left: `${spark.x}%`, animationDelay: `${spark.delay}s`, animationDuration: `${spark.duration}s`, width: spark.size, height: spark.size }} />)}

      <div className={`reveal-panel ${bundle.results.length > 1 ? 'reveal-panel-multi' : ''}`}>
        <div className="reveal-heading">
          <span>{bundle.results.length > 1 ? `KẾT QUẢ ${bundle.results.length} GÓI` : best.isNew ? 'VẬT PHẨM MỚI' : 'ĐÃ THU THẬP'}</span>
          <h2>{bundle.results.length > 1 ? 'Tất cả gói đã được xé' : best.item.name}</h2>
          <p>{bundle.results.length > 1 ? `Vật phẩm hiếm nhất: ${best.item.name}` : best.item.desc}</p>
        </div>

        {bundle.results.length === 1 ? (
          <div className="single-reveal-card">
            <div className="rarity-orbit"><span /><span /><span /></div>
            <ItemVisual item={best.item} large />
            <div className="single-reveal-meta"><span style={{ color: rarity.color }}>{rarity.name}</span><strong>{best.isNew ? 'Mới mở khóa' : `Đang sở hữu ×${best.totalCount}`}</strong></div>
          </div>
        ) : (
          <div className="multi-reveal-grid">
            {bundle.results.map((result, index) => {
              const info = ITEM_RARITIES[result.item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;
              return (
                <article key={`${result.item.id}-${index}`} style={{ '--item-rarity': info.border }}>
                  <span className="multi-index">#{index + 1}</span>
                  {result.isNew && <span className="new-pill">MỚI</span>}
                  <ItemVisual item={result.item} />
                  <strong>{result.item.name}</strong>
                  <small style={{ color: info.color }}>{info.name}</small>
                </article>
              );
            })}
          </div>
        )}

        <div className="reveal-actions">
          <button type="button" className="reveal-primary" onClick={onOpenAgain}>Xé tiếp {bundle.count}×</button>
          <button type="button" onClick={onInventory}>Mở kho đồ</button>
          <button type="button" onClick={onClose}>Về trang chính</button>
        </div>
      </div>
    </div>
  );
}
