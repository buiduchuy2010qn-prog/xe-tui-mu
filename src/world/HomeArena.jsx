import React, { useState } from 'react';
import { PackageVisual } from '../components/PackageVisual';
import { BAG_CATEGORIES, BAGS } from '../data/bags';
import { Icon } from './Icon';
import { formatNumber, QUANTITIES } from './gameLogic';

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
          <div><i style={{ width: `${Math.max(2, bag.rates[key] * 100)}%` }} /></div>
          <strong>{Math.round(bag.rates[key] * 100)}%</strong>
        </div>
      ))}
    </div>
  );
}

export function HomeArena({ state, selectedBag, quantity, onQuantity, onSelectBag, onOpen, onClaimFree, freeRemaining, onEarn }) {
  const [category, setCategory] = useState('Tất cả');
  const totalCost = selectedBag.cost * quantity;
  const unlocked = state.level >= selectedBag.minLevel;
  const pity = state.pityMap[selectedBag.id] || { rare: 0, epic: 0 };
  const visibleBags = category === 'Tất cả' ? BAGS : BAGS.filter((bag) => bag.category === category);

  return (
    <main className="game-shell">
      <section className="arena" style={{ '--arena-accent': selectedBag.borderColor, '--arena-secondary': selectedBag.secondaryColor }}>
        <div className="arena-copy">
          <div className="eyebrow"><Icon name="globe" size={17} /> VŨ TRỤ TÚI MÙ TOÀN CẦU</div>
          <h1>Chọn kiểu bao bì.<br /><em>Tự tay xé bí ẩn.</em></h1>
          <p>Từ gói foil, túi giấy, capsule, hộp mù đến bao lì xì và túi phúc. Mỗi loại có hình dáng, chất liệu và âm thanh xé riêng.</p>
          <div className="arena-badges"><span>{BAGS.length} dạng túi và bao bì</span><span>Âm thanh theo chất liệu</span><span>Kéo tay trên điện thoại</span></div>
          <div className="quantity-block">
            <label>Số túi trong lượt</label>
            <div className="quantity-switch">{QUANTITIES.map((value) => <button type="button" key={value} className={quantity === value ? 'active' : ''} onClick={() => onQuantity(value)}>{value}×</button>)}</div>
          </div>
          <button type="button" className="primary-open-button" disabled={!unlocked || state.coins < totalCost} onClick={() => onOpen(selectedBag, quantity)}>
            <span className="primary-open-icon"><Icon name="gift" /></span>
            <span><strong>{unlocked ? 'Cầm gói và bắt đầu xé' : `Cần đạt cấp ${selectedBag.minLevel}`}</strong><small>{formatNumber(totalCost)} xu · phải kéo tay để mở</small></span>
            <Icon name="chevron" />
          </button>
          <div className="arena-secondary-actions">
            <button type="button" className="free-coin-button" disabled={Boolean(freeRemaining)} onClick={onClaimFree}>{freeRemaining ? `Xu miễn phí sau ${freeRemaining}` : 'Nhận 100 xu miễn phí'}</button>
            <button type="button" className="earn-coin-button" onClick={onEarn}><Icon name="bolt" size={18} /> Mở khu Kiếm Xu</button>
          </div>
        </div>

        <div className="arena-visual">
          <div className="bag-stage-label"><span>{selectedBag.badge}</span><strong>{selectedBag.name}</strong></div>
          <div className="bag-stage"><div className="stage-ring stage-ring-one" /><div className="stage-ring stage-ring-two" /><PackageVisual bag={selectedBag} /></div>
          <div className="bag-stage-footer">
            <div><small>GIÁ MỞ</small><strong>{formatNumber(selectedBag.cost)} xu</strong></div>
            <div><small>NGUỒN GỐC</small><strong>{selectedBag.origin}</strong></div>
            <div><small>BẢO HIỂM HIẾM</small><strong>{pity.rare}/{selectedBag.pityRareMax}</strong></div>
          </div>
        </div>
      </section>

      <section className="earn-ribbon">
        <div><span className="earn-ribbon-icon"><Icon name="coin" /></span><p><strong>Hết xu vẫn chơi tiếp được.</strong><small>Điểm danh, bắt xu, mở phong bì may mắn, làm nhiệm vụ hoặc bán đồ trùng.</small></p></div>
        <button type="button" onClick={onEarn}>Đi kiếm xu <Icon name="chevron" size={18} /></button>
      </section>

      <section className="bag-section">
        <div className="section-heading"><div><span>THƯ VIỆN TÚI MÙ</span><h2>Các dạng bao bì phổ biến trên thế giới</h2></div><p>Không dùng thương hiệu thật. Mỗi mẫu là một thiết kế nguyên bản lấy cảm hứng từ kiểu đóng gói phổ biến.</p></div>
        <div className="category-tabs">{BAG_CATEGORIES.map((value) => <button type="button" key={value} className={category === value ? 'active' : ''} onClick={() => setCategory(value)}>{value}</button>)}</div>
        <div className="bag-catalog-grid">
          {visibleBags.map((bag) => {
            const isSelected = bag.id === selectedBag.id;
            const isLocked = state.level < bag.minLevel;
            return (
              <button type="button" key={bag.id} className={`bag-choice ${isSelected ? 'selected' : ''} ${isLocked ? 'locked' : ''}`} style={{ '--choice-accent': bag.borderColor, '--choice-secondary': bag.secondaryColor }} onClick={() => !isLocked && onSelectBag(bag.id)}>
                <div className="choice-art"><PackageVisual bag={bag} compact /></div>
                <div className="choice-copy"><span>{bag.origin}</span><strong>{bag.name}</strong><small>{isLocked ? `Mở ở Lv.${bag.minLevel}` : `${formatNumber(bag.cost)} xu · ${bag.badge}`}</small></div>
                {isSelected && <i className="choice-check">✓</i>}{isLocked && <i className="choice-lock">Lv.{bag.minLevel}</i>}
              </button>
            );
          })}
        </div>
      </section>

      <section className="detail-grid">
        <article className="detail-card"><span className="detail-kicker">TỶ LỆ CỦA {selectedBag.name.toUpperCase()}</span><RateBars bag={selectedBag} /></article>
        <article className="detail-card how-card"><span className="detail-kicker">CÁCH CHƠI</span><ol><li><b>01</b><span>Chọn kiểu túi và số lượng muốn mở.</span></li><li><b>02</b><span>Giữ tay kéo ở dải niêm phong bên trái.</span></li><li><b>03</b><span>Kéo liên tục sang phải đến khi đạt đủ lực.</span></li><li><b>04</b><span>Túi rách, bung mảnh và hé lộ vật phẩm.</span></li></ol></article>
      </section>
    </main>
  );
}
