import React, { useState } from 'react';
import { ITEM_RARITIES } from '../data/items';

export const HistoryModal = ({ historyLog, onClearHistory, onClose }) => {
  const [filterRarity, setFilterRarity] = useState('ALL');

  const filteredLog = historyLog.filter(entry => {
    if (filterRarity === 'ALL') return true;
    return entry.item.rarity.toUpperCase() === filterRarity;
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 950, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '650px', maxHeight: '90vh',
        padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(255,255,255,0.2)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>📜 LỊCH SỬ XÉ TÚI</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Ghi lại {historyLog.length} lần xé gần nhất của bạn</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Filter & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.8rem' }}>
          <select 
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.2)',
              background: '#1e1b4b', color: '#fff', fontSize: '0.85rem'
            }}
          >
            <option value="ALL">Tất cả độ hiếm</option>
            <option value="COMMON">Thường</option>
            <option value="RARE">Hiếm</option>
            <option value="EPIC">Sử Thi</option>
            <option value="LEGENDARY">Huyền Thoại</option>
          </select>

          {historyLog.length > 0 && (
            <button 
              className="btn-cute" 
              style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', border: '1px solid #ef4444', fontSize: '0.8rem', padding: '6px 12px' }}
              onClick={() => {
                if (window.confirm('Xóa sạch lịch sử xé túi?')) {
                  onClearHistory();
                }
              }}
            >
              🗑️ Xóa Lịch Sử
            </button>
          )}
        </div>

        {/* Log List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {filteredLog.map((entry, idx) => {
            const rarityInfo = ITEM_RARITIES[entry.item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;
            const timeStr = new Date(entry.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            return (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{timeStr}</span>
                  <div>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', color: rarityInfo.color }}>
                      {entry.item.name} {entry.isNew ? '🌟 (MỚI)' : ''}
                    </h4>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                      {entry.bagName} (-{entry.cost} xu)
                    </span>
                  </div>
                </div>

                <span style={{
                  fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px',
                  background: rarityInfo.bg, color: rarityInfo.color, border: `1px solid ${rarityInfo.border}`
                }}>
                  {entry.item.rarity}
                </span>
              </div>
            );
          })}

          {filteredLog.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
              Chưa có lịch sử xé túi nào. 📜
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
