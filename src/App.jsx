import React, { useEffect, useMemo, useState } from 'react';
import './index.css';
import './App.css';

import { UnboxingStage } from './components/UnboxingStage';
import { BAGS } from './data/bags';
import { ITEM_RARITIES } from './data/items';
import { addExp } from './utils/level';
import {
  exportSaveJson,
  importSaveJson,
  loadState,
  resetState,
  saveState
} from './utils/storage';
import { soundManager } from './utils/sound';

const RARITY_ORDER = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };
const QUANTITIES = [1, 5, 10];
const FREE_COIN_COOLDOWN = 4 * 60 * 60 * 1000;

const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);

function pickWeightedRarity(rates) {
  const entries = ['Legendary', 'Epic', 'Rare', 'Common'].map((rarity) => [rarity, Math.max(0, rates[rarity] || 0)]);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = Math.random() * (total || 1);

  for (const [rarity, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return rarity;
  }
  return 'Common';
}

function unlockAchievements(state) {
  const achievements = { ...state.achievements };
  const unlockedItems = Object.values(state.items).filter((item) => item.unlocked).length;
  const totalItems = Object.keys(state.items).length;
  const newlyUnlocked = [];
  let coins = state.coins;

  const unlock = (id) => {
    const achievement = achievements[id];
    if (!achievement || achievement.unlocked) return;
    achievements[id] = { ...achievement, unlocked: true, unlockedAt: Date.now() };
    coins += Number(achievement.reward) || 0;
    newlyUnlocked.push(achievement.name || 'Thành tích mới');
  };

  if (state.stats.totalOpened >= 1) unlock('first_rip');
  if (state.stats.totalOpened >= 10) unlock('rip_10');
  if (state.stats.totalOpened >= 100) unlock('rip_100');
  if (unlockedItems >= 10) unlock('collect_10');
  if (unlockedItems === totalItems) unlock('master_collector');
  if (state.consecutiveCommon >= 10) unlock('unlucky_10');

  return {
    state: { ...state, coins, achievements },
    newlyUnlocked
  };
}

function buildOpenBundle(state, bag, count) {
  const totalCost = bag.cost * count;
  const items = { ...state.items };
  const quests = Object.fromEntries(
    Object.entries(state.quests).map(([id, quest]) => [id, { ...quest }])
  );
  const pity = { ...(state.pityMap[bag.id] || { rare: 0, epic: 0 }) };
  const history = [...state.historyLog];
  const results = [];
  let consecutiveCommon = state.consecutiveCommon || 0;

  const increaseQuest = (id, amount = 1) => {
    if (!quests[id]) return;
    quests[id].progress = Math.min(quests[id].target, (quests[id].progress || 0) + amount);
  };

  for (let index = 0; index < count; index += 1) {
    const rates = { ...bag.rates };
    if (pity.rare >= bag.pityRareMax) rates.Rare += 0.2;
    if (pity.epic >= bag.pityEpicMax) rates.Epic += 0.15;

    const rarity = pickWeightedRarity(rates);
    const pool = Object.values(items).filter((item) => item.rarity === rarity);
    const selected = pool[Math.floor(Math.random() * pool.length)] || Object.values(items)[0];
    const stored = items[selected.id];
    const isNew = !stored.unlocked;
    const totalCount = (stored.count || 0) + 1;

    items[selected.id] = {
      ...stored,
      unlocked: true,
      count: totalCount,
      firstObtainedAt: stored.firstObtainedAt || Date.now()
    };

    const rarePlus = ['Rare', 'Epic', 'Legendary'].includes(rarity);
    pity.rare = rarePlus ? 0 : pity.rare + 1;
    pity.epic = ['Epic', 'Legendary'].includes(rarity) ? 0 : pity.epic + 1;
    consecutiveCommon = rarity === 'Common' ? consecutiveCommon + 1 : 0;

    increaseQuest('daily_rip3');
    increaseQuest('weekly_rip30');
    if (isNew) increaseQuest('daily_new1');
    if (rarePlus) increaseQuest('daily_rare1');

    const resultItem = { ...items[selected.id] };
    const result = { item: resultItem, isNew, totalCount };
    results.push(result);
    history.unshift({
      id: `${Date.now()}-${index}`,
      timestamp: Date.now(),
      bagName: bag.name,
      cost: bag.cost,
      item: resultItem,
      rarity,
      isNew
    });
  }

  const unlockedCount = Object.values(items).filter((item) => item.unlocked).length;
  if (quests.weekly_collect10) {
    quests.weekly_collect10.progress = Math.min(quests.weekly_collect10.target, unlockedCount);
  }

  const levelResult = addExp(state.level, state.exp, bag.expGain * count);
  const nextState = {
    ...state,
    coins: state.coins - totalCost + levelResult.totalRewardCoins,
    level: levelResult.level,
    exp: levelResult.exp,
    selectedBagId: bag.id,
    items,
    quests,
    pityMap: { ...state.pityMap, [bag.id]: pity },
    consecutiveCommon,
    historyLog: history.slice(0, 60),
    stats: {
      ...state.stats,
      totalOpened: state.stats.totalOpened + count,
      totalSpent: state.stats.totalSpent + totalCost
    }
  };

  const achievementResult = unlockAchievements(nextState);
  return {
    nextState: achievementResult.state,
    results,
    levelResult,
    achievements: achievementResult.newlyUnlocked
  };
}

function Icon({ name, size = 22 }) {
  const paths = {
    bag: 'M6 8h12l1 12H5L6 8Zm3 0V6a3 3 0 0 1 6 0v2',
    grid: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
    task: 'M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01',
    sound: 'M5 9v6h4l5 4V5L9 9H5Zm12.5 1.2a3 3 0 0 1 0 3.6M19.8 7a7 7 0 0 1 0 10',
    mute: 'M5 9v6h4l5 4V5L9 9H5Zm12 1 4 4m0-4-4 4',
    settings: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm0-12v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6-1.4 1.4M7.4 16.6 6 18m12 0-1.4-1.4M7.4 7.4 6 6',
    coin: 'M12 3c5 0 9 2 9 4.5S17 12 12 12 3 10 3 7.5 7 3 12 3Zm-9 4.5V12c0 2.5 4 4.5 9 4.5s9-2 9-4.5V7.5M3 12v4.5C3 19 7 21 12 21s9-2 9-4.5V12',
    chevron: 'm9 18 6-6-6-6',
    close: 'M6 6l12 12M18 6 6 18',
    search: 'm21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z',
    gift: 'M20 12v9H4v-9M2 7h20v5H2V7Zm10 14V7m0 0H7.5A2.5 2.5 0 1 1 12 5v2Zm0 0h4.5A2.5 2.5 0 1 0 12 5v2Z',
    heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z'
  };

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={paths[name] || paths.gift} />
    </svg>
  );
}

function BagArt({ bag, compact = false }) {
  return (
    <div className={`bag-object ${compact ? 'bag-object-compact' : ''}`} style={{ '--bag-accent': bag.borderColor }}>
      <div className="bag-object-glow" />
      <div className="bag-object-shadow" />
      <div className="bag-object-body">
        {bag.img ? <img src={bag.img} alt={bag.name} draggable="false" /> : <span>{bag.icon}</span>}
        <div className="bag-object-sheen" />
        <div className="bag-object-seal"><span /><span /><span /></div>
      </div>
    </div>
  );
}

function TopBar({ state, onPanel, onToggleSound }) {
  const unlocked = Object.values(state.items).filter((item) => item.unlocked).length;
  const total = Object.keys(state.items).length;

  return (
    <header className="topbar">
      <button className="brand" type="button" onClick={() => onPanel(null)}>
        <span className="brand-mark"><Icon name="bag" /></span>
        <span><strong>Xé Túi Mù</strong><small>VÔ TRI LAB</small></span>
      </button>

      <div className="topbar-stats">
        <div className="stat-chip coin-chip"><Icon name="coin" size={18} /><span>{formatNumber(state.coins)}</span><small>xu</small></div>
        <div className="stat-chip"><span className="level-dot">{state.level}</span><span>Lv.{state.level}</span></div>
        <div className="stat-chip desktop-only"><Icon name="grid" size={18} /><span>{unlocked}/{total}</span></div>
      </div>

      <nav className="topbar-actions" aria-label="Điều hướng">
        <button type="button" onClick={() => onPanel('inventory')} aria-label="Kho đồ"><Icon name="grid" /></button>
        <button type="button" onClick={() => onPanel('missions')} aria-label="Nhiệm vụ"><Icon name="task" /></button>
        <button type="button" onClick={onToggleSound} aria-label="Bật hoặc tắt âm thanh"><Icon name={state.settings.sound ? 'sound' : 'mute'} /></button>
        <button type="button" onClick={() => onPanel('settings')} aria-label="Cài đặt"><Icon name="settings" /></button>
      </nav>
    </header>
  );
}

function RateBars({ bag }) {
  const rates = [
    ['Common', 'Thường'],
    ['Rare', 'Hiếm'],
    ['Epic', 'Sử thi'],
    ['Legendary', 'Huyền thoại']
  ];
  return (
    <div className="rate-bars">
      {rates.map(([key, label]) => (
        <div className={`rate-row rarity-${key.toLowerCase()}`} key={key}>
          <span>{label}</span>
          <div><i style={{ width: `${Math.max(3, bag.rates[key] * 100)}%` }} /></div>
          <strong>{Math.round(bag.rates[key] * 100)}%</strong>
        </div>
      ))}
    </div>
  );
}

function HomeArena({ state, selectedBag, quantity, onQuantity, onSelectBag, onOpen, onClaimFree, freeRemaining }) {
  const totalCost = selectedBag.cost * quantity;
  const unlocked = state.level >= selectedBag.minLevel;
  const pity = state.pityMap[selectedBag.id] || { rare: 0, epic: 0 };

  return (
    <main className="game-shell">
      <section className="arena" style={{ '--arena-accent': selectedBag.borderColor }}>
        <div className="arena-copy">
          <div className="eyebrow"><span /> TRẢI NGHIỆM XÉ THẬT</div>
          <h1>Tự tay kéo.<br /><em>Xé tung bí ẩn.</em></h1>
          <p>Giữ mép niêm phong và kéo bằng tay. Túi sẽ căng, rách, bung mảnh và phát âm thanh theo đúng lực kéo của bạn.</p>

          <div className="arena-badges">
            <span>Âm thanh kéo–rách nhiều lớp</span>
            <span>Hỗ trợ cảm ứng</span>
            <span>Rung phản hồi</span>
          </div>

          <div className="quantity-block">
            <label>Số túi trong lượt</label>
            <div className="quantity-switch">
              {QUANTITIES.map((value) => (
                <button type="button" key={value} className={quantity === value ? 'active' : ''} onClick={() => onQuantity(value)}>
                  {value}×
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="primary-open-button"
            disabled={!unlocked || state.coins < totalCost}
            onClick={() => onOpen(selectedBag, quantity)}
          >
            <span className="primary-open-icon"><Icon name="gift" /></span>
            <span>
              <strong>{unlocked ? 'Cầm túi và bắt đầu xé' : `Cần đạt cấp ${selectedBag.minLevel}`}</strong>
              <small>{formatNumber(totalCost)} xu · kéo tay để mở</small>
            </span>
            <Icon name="chevron" />
          </button>

          <button type="button" className="free-coin-button" disabled={freeRemaining > 0} onClick={onClaimFree}>
            {freeRemaining > 0 ? `Xu miễn phí sau ${freeRemaining}` : 'Nhận 100 xu miễn phí'}
          </button>
        </div>

        <div className="arena-visual">
          <div className="bag-stage-label"><span>{selectedBag.badge}</span><strong>{selectedBag.name}</strong></div>
          <div className="bag-stage"><div className="stage-ring stage-ring-one" /><div className="stage-ring stage-ring-two" /><BagArt bag={selectedBag} /></div>
          <div className="bag-stage-footer">
            <div><small>GIÁ MỞ</small><strong>{formatNumber(selectedBag.cost)} xu</strong></div>
            <div><small>EXP</small><strong>+{selectedBag.expGain}</strong></div>
            <div><small>BẢO HIỂM HIẾM</small><strong>{pity.rare}/{selectedBag.pityRareMax}</strong></div>
          </div>
        </div>
      </section>

      <section className="bag-section">
        <div className="section-heading"><div><span>CHỌN LOẠI TÚI</span><h2>Mỗi túi có cảm giác và tỷ lệ khác nhau</h2></div><p>Chạm vào túi để xem trước. Khi mở, cả lượt 1×, 5× và 10× đều yêu cầu bạn tự kéo đường xé.</p></div>
        <div className="bag-strip">
          {BAGS.map((bag) => {
            const isSelected = bag.id === selectedBag.id;
            const isLocked = state.level < bag.minLevel;
            return (
              <button
                type="button"
                key={bag.id}
                className={`bag-choice ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                style={{ '--choice-accent': bag.borderColor }}
                onClick={() => !isLocked && onSelectBag(bag.id)}
              >
                <div className="choice-art"><BagArt bag={bag} compact /></div>
                <div className="choice-copy"><span>{bag.badge}</span><strong>{bag.name}</strong><small>{isLocked ? `Mở ở Lv.${bag.minLevel}` : `${formatNumber(bag.cost)} xu/lượt`}</small></div>
                {isSelected && <i className="choice-check">✓</i>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="detail-grid">
        <article className="detail-card"><span className="detail-kicker">TỶ LỆ CỦA {selectedBag.name.toUpperCase()}</span><RateBars bag={selectedBag} /></article>
        <article className="detail-card how-card"><span className="detail-kicker">CÁCH CHƠI</span><ol><li><b>01</b><span>Chọn túi và số lượng muốn mở.</span></li><li><b>02</b><span>Giữ mép niêm phong sáng ở bên trái.</span></li><li><b>03</b><span>Kéo hết sang phải cho đến khi túi rách.</span></li><li><b>04</b><span>Chờ ánh sáng bung ra và nhận vật phẩm.</span></li></ol></article>
      </section>
    </main>
  );
}

function ItemVisual({ item, large = false }) {
  return (
    <div className={`item-visual ${large ? 'item-visual-large' : ''}`}>
      {item.img ? <img src={item.img} alt={item.name} /> : <span>{item.icon}</span>}
    </div>
  );
}

function RevealStage({ bundle, particlesEnabled, onClose, onOpenAgain, onInventory }) {
  const [ready, setReady] = useState(false);
  const best = bundle.results.reduce((current, result) => RARITY_ORDER[result.item.rarity] > RARITY_ORDER[current.item.rarity] ? result : current, bundle.results[0]);
  const rarity = ITEM_RARITIES[best.item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;
  const sparks = useMemo(() => Array.from({ length: particlesEnabled ? 54 : 0 }, (_, index) => ({
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
        <div className="reveal-heading"><span>{bundle.results.length > 1 ? `KẾT QUẢ ${bundle.results.length} TÚI` : best.isNew ? 'VẬT PHẨM MỚI' : 'ĐÃ THU THẬP'}</span><h2>{bundle.results.length > 1 ? 'Túi đã bung hoàn toàn' : best.item.name}</h2><p>{bundle.results.length > 1 ? `Vật phẩm hiếm nhất: ${best.item.name}` : best.item.desc}</p></div>

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
              return <article key={`${result.item.id}-${index}`} style={{ '--item-rarity': info.border }}><span className="multi-index">#{index + 1}</span>{result.isNew && <span className="new-pill">MỚI</span>}<ItemVisual item={result.item} /><strong>{result.item.name}</strong><small style={{ color: info.color }}>{info.name}</small></article>;
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

function InventoryPanel({ state, onClose, onToggleFavorite }) {
  const [query, setQuery] = useState('');
  const [rarity, setRarity] = useState('All');
  const items = useMemo(() => Object.values(state.items)
    .filter((item) => rarity === 'All' || item.rarity === rarity)
    .filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
    .sort((a, b) => Number(b.isFavorite) - Number(a.isFavorite) || Number(b.unlocked) - Number(a.unlocked) || RARITY_ORDER[b.rarity] - RARITY_ORDER[a.rarity]), [state.items, query, rarity]);
  const unlocked = Object.values(state.items).filter((item) => item.unlocked).length;
  const total = Object.keys(state.items).length;

  return (
    <div className="panel-overlay"><section className="panel collection-panel">
      <div className="panel-header"><div><span>KHO SƯU TẬP</span><h2>{unlocked}/{total} vật phẩm đã mở</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></div>
      <div className="collection-progress"><i style={{ width: `${Math.round(unlocked / total * 100)}%` }} /></div>
      <div className="collection-tools"><label><Icon name="search" size={19} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm vật phẩm..." /></label><div>{['All', 'Common', 'Rare', 'Epic', 'Legendary'].map((value) => <button type="button" key={value} className={rarity === value ? 'active' : ''} onClick={() => setRarity(value)}>{value === 'All' ? 'Tất cả' : ITEM_RARITIES[value.toUpperCase()].name}</button>)}</div></div>
      <div className="collection-grid">
        {items.map((item) => {
          const info = ITEM_RARITIES[item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;
          return <article key={item.id} className={!item.unlocked ? 'locked' : ''} style={{ '--item-rarity': info.border }}>
            {item.unlocked && <button className={`favorite-button ${item.isFavorite ? 'active' : ''}`} type="button" onClick={() => onToggleFavorite(item.id)}><Icon name="heart" size={17} /></button>}
            <ItemVisual item={item.unlocked ? item : { icon: '？', name: 'Chưa mở khóa' }} />
            <strong>{item.unlocked ? item.name : 'Chưa khám phá'}</strong><span style={{ color: item.unlocked ? info.color : '#677083' }}>{item.unlocked ? info.name : '???'}</span>{item.unlocked && <small>×{item.count}</small>}
          </article>;
        })}
      </div>
    </section></div>
  );
}

function MissionsPanel({ state, onClose, onClaim }) {
  const quests = Object.values(state.quests);
  return (
    <div className="panel-overlay"><section className="panel compact-panel">
      <div className="panel-header"><div><span>NHIỆM VỤ</span><h2>Kiếm thêm xu để tiếp tục xé</h2></div><button type="button" onClick={onClose}><Icon name="close" /></button></div>
      <div className="quest-list">{quests.map((quest) => {
        const done = quest.progress >= quest.target;
        return <article key={quest.id}><div className="quest-icon"><Icon name="task" /></div><div className="quest-copy"><span>{quest.type === 'daily' ? 'HẰNG NGÀY' : 'HẰNG TUẦN'}</span><strong>{quest.name}</strong><div><i style={{ width: `${Math.min(100, quest.progress / quest.target * 100)}%` }} /></div><small>{Math.min(quest.progress, quest.target)}/{quest.target}</small></div><button type="button" disabled={!done || quest.claimed} onClick={() => onClaim(quest.id)}>{quest.claimed ? 'Đã nhận' : done ? `+${quest.reward} xu` : `${quest.reward} xu`}</button></article>;
      })}</div>
    </section></div>
  );
}

function SettingsPanel({ state, onClose, onToggleSound, onToggleParticles, onTutorial, onExport, onImport, onReset }) {
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
        <button type="button" onClick={onToggleSound}><span><Icon name={state.settings.sound ? 'sound' : 'mute'} /><b>Âm thanh chân thật</b><small>Kéo căng, nứt mép, rách và bung túi.</small></span><i className={state.settings.sound ? 'toggle active' : 'toggle'} /></button>
        <button type="button" onClick={onToggleParticles}><span><Icon name="gift" /><b>Hiệu ứng ánh sáng</b><small>Mảnh túi, tia sáng và particle khi hé lộ.</small></span><i className={state.settings.particles ? 'toggle active' : 'toggle'} /></button>
        <button type="button" onClick={onTutorial}><span><Icon name="task" /><b>Xem lại hướng dẫn</b><small>Học lại thao tác kéo để xé túi.</small></span><Icon name="chevron" /></button>
      </div>
      <div className="data-actions"><button type="button" onClick={onExport}>Xuất dữ liệu</button><label>Nhập dữ liệu<input type="file" accept="application/json" onChange={handleFile} /></label><button type="button" className="danger" onClick={onReset}>Đặt lại trò chơi</button></div>
      <p className="version-note">Xé Túi Mù Vô Tri · Giao diện và cách chơi thế hệ 4</p>
    </section></div>
  );
}

function Tutorial({ onComplete }) {
  const [step, setStep] = useState(0);
  const steps = [
    { tag: 'BƯỚC 1', title: 'Chọn túi bạn muốn xé', text: 'Mỗi túi có giá, tỷ lệ và chất liệu âm thanh khác nhau.', visual: 'select' },
    { tag: 'BƯỚC 2', title: 'Giữ đúng mép niêm phong', text: 'Đặt ngón tay lên tay kéo sáng ở bên trái chiếc túi.', visual: 'hold' },
    { tag: 'BƯỚC 3', title: 'Kéo hết sang phải', text: 'Túi sẽ căng theo lực kéo. Kéo đủ mạnh để đường xé chạy hết.', visual: 'tear' },
    { tag: 'BƯỚC 4', title: 'Chờ vật phẩm xuất hiện', text: 'Túi bung thành hai mảnh, ánh sáng phát ra và kết quả được hé lộ.', visual: 'reveal' }
  ];
  const current = steps[step];
  return (
    <div className="tutorial-overlay"><section className="tutorial-card">
      <button className="tutorial-skip" type="button" onClick={onComplete}>Bỏ qua</button>
      <div className={`tutorial-visual tutorial-${current.visual}`}><div className="mini-bag"><span className="mini-seal" /><span className="mini-tab" /></div><div className="tutorial-hand">☝</div><div className="tutorial-burst" /></div>
      <div className="tutorial-copy"><span>{current.tag} · {step + 1}/{steps.length}</span><h2>{current.title}</h2><p>{current.text}</p></div>
      <div className="tutorial-dots">{steps.map((_, index) => <i key={index} className={index === step ? 'active' : ''} />)}</div>
      <button className="tutorial-next" type="button" onClick={() => step < steps.length - 1 ? setStep(step + 1) : onComplete()}>{step < steps.length - 1 ? 'Tiếp tục' : 'Bắt đầu xé'}<Icon name="chevron" /></button>
    </section></div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="game-toast"><span>✓</span>{message}</div>;
}

export default function App() {
  const [gameState, setGameState] = useState(() => loadState());
  const [quantity, setQuantity] = useState(1);
  const [activePanel, setActivePanel] = useState(null);
  const [pendingOpen, setPendingOpen] = useState(null);
  const [revealBundle, setRevealBundle] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => !loadState().tutorialCompleted);
  const [toast, setToast] = useState('');
  const [clock, setClock] = useState(Date.now());

  useEffect(() => saveState(gameState), [gameState]);
  useEffect(() => soundManager.setEnabled(gameState.settings.sound), [gameState.settings.sound]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 30000);
    return () => { window.clearInterval(timer); soundManager.stopStretch(); };
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const selectedBag = BAGS.find((bag) => bag.id === gameState.selectedBagId) || BAGS[0];
  const remainingMs = Math.max(0, FREE_COIN_COOLDOWN - (clock - (gameState.lastFreeClaimTime || 0)));
  const freeRemaining = remainingMs > 0 ? `${Math.floor(remainingMs / 3600000)}:${String(Math.floor((remainingMs % 3600000) / 60000)).padStart(2, '0')}` : '';

  const openBag = (bag, count) => {
    if (pendingOpen) return;
    if (gameState.level < bag.minLevel) { setToast(`Cần đạt cấp ${bag.minLevel}`); return; }
    if (gameState.coins < bag.cost * count) { setToast('Không đủ xu để mở lượt này'); return; }

    const bundle = buildOpenBundle(gameState, bag, count);
    setGameState(bundle.nextState);
    saveState(bundle.nextState);
    setPendingOpen({ id: `${Date.now()}-${bag.id}`, bag, count, results: bundle.results });

    if (bundle.levelResult.leveledUp) setToast(`Lên Lv.${bundle.levelResult.level} · +${bundle.levelResult.totalRewardCoins} xu`);
    else if (bundle.achievements.length) setToast(`Mở khóa: ${bundle.achievements[0]}`);
  };

  const finishTear = () => {
    if (!pendingOpen) return;
    const bundle = pendingOpen;
    setPendingOpen(null);
    setRevealBundle(bundle);
  };

  const claimQuest = (questId) => {
    const quest = gameState.quests[questId];
    if (!quest || quest.claimed || quest.progress < quest.target) return;
    soundManager.playCoin();
    setGameState((state) => ({ ...state, coins: state.coins + quest.reward, quests: { ...state.quests, [questId]: { ...quest, claimed: true } } }));
    setToast(`Đã nhận ${quest.reward} xu`);
  };

  const claimFree = () => {
    if (remainingMs > 0) return;
    soundManager.playCoin();
    setGameState((state) => ({ ...state, coins: state.coins + 100, lastFreeClaimTime: Date.now() }));
    setClock(Date.now());
    setToast('Đã nhận 100 xu miễn phí');
  };

  const toggleFavorite = (itemId) => setGameState((state) => ({ ...state, items: { ...state.items, [itemId]: { ...state.items[itemId], isFavorite: !state.items[itemId].isFavorite } } }));
  const completeTutorial = () => { setShowTutorial(false); setGameState((state) => ({ ...state, tutorialCompleted: true })); };
  const resetGame = () => {
    if (!window.confirm('Xóa toàn bộ xu, vật phẩm và tiến trình?')) return;
    const fresh = resetState();
    setGameState(fresh);
    setActivePanel(null);
    setRevealBundle(null);
    setPendingOpen(null);
    setShowTutorial(true);
  };

  return (
    <div className="app-root">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="page-noise" />
      <TopBar state={gameState} onPanel={setActivePanel} onToggleSound={() => setGameState((state) => ({ ...state, settings: { ...state.settings, sound: !state.settings.sound } }))} />
      <HomeArena state={gameState} selectedBag={selectedBag} quantity={quantity} onQuantity={setQuantity} onSelectBag={(id) => setGameState((state) => ({ ...state, selectedBagId: id }))} onOpen={openBag} onClaimFree={claimFree} freeRemaining={freeRemaining} />
      <footer className="game-footer"><span>Xé Túi Mù Vô Tri</span><span>Dữ liệu được tự động lưu trên thiết bị</span></footer>

      {pendingOpen && <UnboxingStage key={pendingOpen.id} bag={pendingOpen.bag} count={pendingOpen.count} onComplete={finishTear} />}
      {revealBundle && <RevealStage bundle={revealBundle} particlesEnabled={gameState.settings.particles} onClose={() => setRevealBundle(null)} onInventory={() => { setRevealBundle(null); setActivePanel('inventory'); }} onOpenAgain={() => { const bundle = revealBundle; setRevealBundle(null); window.setTimeout(() => openBag(bundle.bag, bundle.count), 0); }} />}
      {activePanel === 'inventory' && <InventoryPanel state={gameState} onClose={() => setActivePanel(null)} onToggleFavorite={toggleFavorite} />}
      {activePanel === 'missions' && <MissionsPanel state={gameState} onClose={() => setActivePanel(null)} onClaim={claimQuest} />}
      {activePanel === 'settings' && <SettingsPanel state={gameState} onClose={() => setActivePanel(null)} onToggleSound={() => setGameState((state) => ({ ...state, settings: { ...state.settings, sound: !state.settings.sound } }))} onToggleParticles={() => setGameState((state) => ({ ...state, settings: { ...state.settings, particles: !state.settings.particles } }))} onTutorial={() => { setActivePanel(null); setShowTutorial(true); }} onExport={() => exportSaveJson(gameState)} onImport={(text) => { const imported = importSaveJson(text); if (imported) { setGameState(imported); setActivePanel(null); setToast('Đã nhập dữ liệu thành công'); } }} onReset={resetGame} />}
      {showTutorial && <Tutorial onComplete={completeTutorial} />}
      <Toast message={toast} />
    </div>
  );
}
