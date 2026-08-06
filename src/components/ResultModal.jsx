import React from 'react';
import { ITEM_RARITIES } from '../data/items';

export const ResultModal = ({ resultData, onClose, onRipAgain, onOpenInventory }) => {
  if (!resultData) return null;

  const { item, isNew, totalCount } = resultData;
  const rarityInfo = ITEM_RARITIES[item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;

  return (
    <div className="result-overlay" role="dialog" aria-modal="true" aria-label={`Nhận được ${item.name}`}>
      <div className="result-card" style={{ '--rarity-color': rarityInfo.border || rarityInfo.color }}>
        {isNew && <div className="result-new-badge">VẬT PHẨM MỚI</div>}

        <p className="result-eyebrow">KẾT QUẢ MỞ TÚI</p>

        <div className="result-artwork-shell">
          <div className="result-artwork-ring" />
          <div className="result-artwork">
            {item.img ? (
              <img src={item.img} alt={item.name} />
            ) : (
              <span aria-hidden="true">{item.icon}</span>
            )}
          </div>
        </div>

        <div className="result-copy">
          <h2>{item.name}</h2>
          <div className="result-meta">
            <span>{rarityInfo.name}</span>
            <span>Sở hữu ×{totalCount}</span>
            {!isNew && <span>Trùng +1</span>}
          </div>
          <p className="result-description">“{item.desc}”</p>
        </div>

        <div className="result-actions">
          <button type="button" className="result-primary" onClick={onRipAgain}>
            Xé tiếp
          </button>
          <button type="button" onClick={onOpenInventory}>
            Xem kho đồ
          </button>
          <button type="button" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
