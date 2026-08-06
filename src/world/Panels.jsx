import React, { useMemo, useState } from 'react';
import { ITEM_RARITIES } from '../data/items';
import { Icon } from './Icon';
import { ItemVisual } from './Results';
import { DAILY_REWARDS, RARITY_ORDER, formatNumber } from './gameLogic';

export function InventoryPanel({ state, onClose, onToggleFavorite, onSellDuplicate, onSellAllDuplicates }) {
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('All');
  const items = useMemo(() => Object.values(state.items)
    .filter((item) => rarity === 'All' || item.rarity === rarity)
    .filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || Number(b.unlocked) - Number(a.unlocked) || RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]), [state.items, query, rarity]);
  const unlocked = Object.values(state.items).filter((item) => item.unlocked).length;
  const total = Object.keys(state.items).length;
  const duplicateValue = Object.values(state.items).reduce((sum, item) => sum + Math.max(0, (item.count || 0) - 1) * Math.max(1, Math.round((item.value || 5) * 0.6)), 0);

  return (
    <div className="panel-overlay"><section className="panel collection-panel">
      <div className="panel-header"><div><span>KHO SƯU TẬP</span><h2>{unlocked}/{total} vật phẩm đã mở</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></div>
      <div className="collection-progress"><i style={{ width: `${Math.round(unlocked / total * 100)}%` }} /></div>
      <div className="inventory-sell-bar"><span><Icon name="recycle" /><b>Đồ trùng có thể bán lấy xu</b><small>Tổng giá trị hiện tại: {formatNumber(duplicateValue)} xu</small></span><button type="button" disabled={duplicateValue <= 0} onClick={onSellAllDuplicates}>Bán tất cả đồ trùng</button></div>
      <div className="collection-tools"><label><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm vật phẩm..." /></label><div>{['All', 'Common', 'Rare', 'Epic', 'Legendary'].map((value) => <button type="button" key={value} className={rarity === value ? 'active' : ''} onClick={() => setRarity(value)}>{value === 'All' ? 'Tất cả' : ITEM_RARITIES[value.toUpperCase()].name}</button>)}</div></div>
      <div className="collection-grid">
        {items.map((item) => {
          const info = ITEM_RARITIES[item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;
          const sellValue = Math.max(1, Math.round((item.value || 5) * 0.6));
          return <article key={item.id} className={!item.unlocked ? 'locked' : ''} style={{ '--item-rarity': info.border }}>
            {item.unlocked && <button className={`favorite-button ${item.isFavorite ? 'active' : ''}`} type="button" onClick={() => onToggleFavorite(item.id)}><Icon name="heart" size={17} /></button>}
            <ItemVisual item={item.unlocked ? item : { icon: '？', name: 'Chưa mở khóa' }} />
            <strong>{item.unlocked ? item.name : 'Chưa khám phá'}</strong>
            <span style={{ color: item.unlocked ? info.color : '#677083' }}>{item.unlocked ? info.name : '???'}</span>
            {item.unlocked && <small>×{item.count}</small>}
            {item.unlocked && item.count > 1 && <button type="button" className="sell-one-button" onClick={() => onSellDuplicate(item.id, sellValue)}>Bán 1 bản trùng · +{sellValue}</button>}
          </article>;
        })}
      </div>
    </section></div>
  );
}

export function MissionsPanel({ state, onClose, onClaim }) {
  const quests = Object.values(state.quests);
  return (
    <div className="panel-overlay"><section className="panel compact-panel">
      <div className="panel-header"><div><span>NHIỆM VỤ</span><h2>Hoàn thành để nhận thêm xu</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></div>
      <div className="quest-list">{quests.map((quest) => {
        const done = quest.progress >= quest.target;
        return <article key={quest.id}><div className="quest-icon"><Icon name="task" /></div><div className="quest-copy"><span>{quest.type === 'daily' ? 'HẰNG NGÀY' : 'HẰNG TUẦN'}</span><strong>{quest.name}</strong><div><i style={{ width: `${Math.min(100, quest.progress / quest.target * 100)}%` }} /></div><small>{Math.min(quest.progress, quest.target)}/{quest.target}</small></div><button type="button" disabled={!done || quest.claimed} onClick={() => onClaim(quest.id)}>{quest.claimed ? 'Đã nhận' : done ? `+${quest.reward} xu` : `${quest.reward} xu`}</button></article>;
      })}</div>
    </section></div>
  );
}

export function EarnCoinsPanel({ state, onClose, onStartCatch, onDailyClaim, onLuckyClaim, onFreeClaim, onSellAllDuplicates, freeRemaining, luckyRemaining, catchPlaysLeft }) {
  const streak = state.economy?.dailyStreak || 0;
  const claimedToday = state.economy?.dailyClaimKey === new Date().toLocaleDateString('en-CA');
  const duplicateValue = Object.values(state.items).reduce((sum, item) => sum + Math.max(0, (item.count || 0) - 1) * Math.max(1, Math.round((item.value || 5) * 0.6)), 0);

  return (
    <div className="panel-overlay"><section className="panel earn-panel">
      <div className="panel-header"><div><span>KHU KIẾM XU</span><h2>Chơi và nhận xu miễn phí</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></div>

      <div className="earn-hero-card">
        <div><span>MINI-GAME CHÍNH</span><h3>Bắt Túi Mù Rơi</h3><p>Kéo giỏ để bắt túi trong 30 giây. Combo càng cao, xu nhận được càng nhiều.</p><div><b>3 mạng</b><b>5 lượt/ngày</b><b>Tối đa 800 xu/lượt</b></div></div>
        <div className="earn-hero-visual"><i className="fall-preview fall-preview-one">◆</i><i className="fall-preview fall-preview-two">✦</i><i className="fall-preview fall-preview-three">●</i><span>WORLD PACK</span></div>
        <button type="button" disabled={catchPlaysLeft <= 0} onClick={onStartCatch}>{catchPlaysLeft > 0 ? `Chơi ngay · còn ${catchPlaysLeft} lượt` : 'Hết lượt hôm nay'}</button>
      </div>

      <div className="daily-reward-card">
        <div className="earn-section-title"><span><Icon name="calendar" /><b>Điểm danh 7 ngày</b></span><small>Chuỗi hiện tại: {streak} ngày</small></div>
        <div className="daily-reward-grid">{DAILY_REWARDS.map((reward, index) => {
          const day = index + 1;
          const active = !claimedToday && day === Math.min(7, streak + 1);
          const completed = day <= streak;
          return <div key={day} className={`${active ? 'active' : ''} ${completed ? 'completed' : ''}`}><span>NGÀY {day}</span><Icon name="coin" size={24} /><strong>{reward}</strong>{completed && <i>✓</i>}</div>;
        })}</div>
        <button type="button" disabled={claimedToday} onClick={onDailyClaim}>{claimedToday ? 'Đã điểm danh hôm nay' : `Nhận thưởng ngày ${Math.min(7, streak + 1)}`}</button>
      </div>

      <div className="earn-method-grid">
        <article><span className="earn-method-icon lucky">福</span><div><b>Phong bì may mắn</b><small>Nhận ngẫu nhiên 25–180 xu mỗi giờ.</small></div><button type="button" disabled={Boolean(luckyRemaining)} onClick={onLuckyClaim}>{luckyRemaining || 'Mở ngay'}</button></article>
        <article><span className="earn-method-icon free"><Icon name="gift" /></span><div><b>Quà xu định kỳ</b><small>Nhận 100 xu sau mỗi 4 giờ.</small></div><button type="button" disabled={Boolean(freeRemaining)} onClick={onFreeClaim}>{freeRemaining || '+100 xu'}</button></article>
        <article><span className="earn-method-icon recycle"><Icon name="recycle" /></span><div><b>Bán vật phẩm trùng</b><small>Giá trị có thể bán: {formatNumber(duplicateValue)} xu.</small></div><button type="button" disabled={duplicateValue <= 0} onClick={onSellAllDuplicates}>Bán tất cả</button></article>
        <article><span className="earn-method-icon task"><Icon name="task" /></span><div><b>Nhiệm vụ</b><small>Xé túi, bắt túi và thu thập đồ mới để nhận thưởng.</small></div><button type="button" onClick={() => { onClose(); window.setTimeout(() => window.dispatchEvent(new CustomEvent('open-missions')), 0); }}>Xem nhiệm vụ</button></article>
      </div>
    </section></div>
  );
}

export function SettingsPanel({ state, onClose, onToggleSound, onToggleParticles, onTutorial, onExport, onImport, onReset }) {
  const handleFile = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onImport(String(reader.result || ''));
    reader.readAsText(file);
  };
  return (
    <div className="panel-overlay"><section className="panel compact-panel settings-panel">
      <div className="panel-header"><div><span>CÀI ĐẶT</span><h2>Trải nghiệm và dữ liệu</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></div>
      <div className="setting-list">
        <button type="button" onClick={onToggleSound}><span><Icon name={state.settings.sound ? 'sound' : 'mute'} /><b>Âm thanh chân thật</b><small>Kéo căng, nứt mép, rách, bung túi và âm thanh mini-game.</small></span><i className={state.settings.sound ? 'toggle active' : 'toggle'} /></button>
        <button type="button" onClick={onToggleParticles}><span><Icon name="gift" /><b>Hiệu ứng ánh sáng</b><small>Mảnh túi, tia sáng và particle khi hé lộ.</small></span><i className={state.settings.particles ? 'toggle active' : 'toggle'} /></button>
        <button type="button" onClick={onTutorial}><span><Icon name="task" /><b>Xem lại hướng dẫn</b><small>Cách xé túi và cách chơi Bắt Túi Mù.</small></span><Icon name="chevron" /></button>
      </div>
      <div className="data-actions"><button type="button" onClick={onExport}>Xuất dữ liệu</button><label>Nhập dữ liệu<input type="file" accept="application/json" onChange={handleFile} /></label><button type="button" className="danger" onClick={onReset}>Đặt lại trò chơi</button></div>
      <p className="version-note">Xé Túi Mù Vô Tri · World Pack v5</p>
    </section></div>
  );
}

export function Tutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    { tag: 'BƯỚC 1', title: 'Khám phá các kiểu túi trên thế giới', text: 'Lọc theo túi mềm, foil, hộp, capsule, phong cách châu Á hoặc cao cấp.', visual: 'select' },
    { tag: 'BƯỚC 2', title: 'Giữ đúng mép niêm phong', text: 'Đặt ngón tay lên tay kéo sáng ở bên trái chiếc túi.', visual: 'hold' },
    { tag: 'BƯỚC 3', title: 'Kéo hết sang phải', text: 'Túi sẽ căng theo lực kéo. Kéo đủ mạnh để đường xé chạy hết.', visual: 'tear' },
    { tag: 'BƯỚC 4', title: 'Chơi Bắt Túi Mù để kiếm xu', text: 'Kéo giỏ bắt túi rơi, giữ combo và tránh bom để có xu mở tiếp.', visual: 'catch' }
  ];
  const current = steps[step];
  return (
    <div className="tutorial-overlay"><section className="tutorial-card">
      <button className="tutorial-skip" type="button" onClick={onComplete}>Bỏ qua</button>
      <div className={`tutorial-visual tutorial-${current.visual}`}><div className="mini-bag"><span className="mini-seal" /><span className="mini-tab" /></div><div className="tutorial-hand">☝</div><div className="tutorial-burst" /><div className="tutorial-basket">WORLD PACK</div></div>
      <div className="tutorial-copy"><span>{current.tag} · {step + 1}/{steps.length}</span><h2>{current.title}</h2><p>{current.text}</p></div>
      <div className="tutorial-dots">{steps.map((_, index) => <i key={index} className={index === step ? 'active' : ''} />)}</div>
      <button className="tutorial-next" type="button" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}>{step < steps.length - 1 ? 'Tiếp tục' : 'Bắt đầu chơi'}<Icon name="chevron" /></button>
    </section></div>
  );
}

export function Toast({ message }) {
  if (!message) return null;
  return <div className="game-toast"><span>✓</span>{message}</div>;
}
