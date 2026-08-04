import React from 'react';
import { ITEM_RARITIES } from '../data/items';

export const MultiResultModal = ({ multiResults, bag, onClose, onRipAgain }) => {
  if (!multiResults || multiResults.length === 0) return null;

  const newCount = multiResults.filter(r => r.isNew).length;
  const rarestRarityOrder = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
  
  // Find rarest item
  const rarestResult = [...multiResults].sort((a, b) => {
    const rA = rarestRarityOrder[a.item.rarity.toUpperCase()] || 0;
    const rB = rarestRarityOrder[b.item.rarity.toUpperCase()] || 0;
    return rB - rA;
  })[0];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '750px', maxHeight: '90vh',
        padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '2px solid rgba(251,191,36,0.5)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fbbf24' }}>
            🎉 KẾT QUẢ XÉ {multiResults.length} TÚI MÙ! 🎉
          </h2>
          <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '4px' }}>
            Bạn thu thập được <strong>{newCount} vật phẩm MỚI!</strong>
          </p>
        </div>

        {/* Items Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', 
          gap: '0.8rem', 
          maxHeight: '400px', 
          overflowY: 'auto',
          padding: '4px'
        }}>
          {multiResults.map((res, idx) => {
            const rarityInfo = ITEM_RARITIES[res.item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;
            const isRarest = res.item.id === rarestResult.item.id;

            return (
              <div 
                key={idx}
                className="glass-panel"
                style={{
                  padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem',
                  background: rarityInfo.bg, border: `2px solid ${rarityInfo.border}`, borderRadius: '18px',
                  boxShadow: isRarest ? `0 0 20px ${rarityInfo.border}` : 'none',
                  position: 'relative'
                }}
              >
                {res.isNew && (
                  <span style={{
                    position: 'absolute', top: '-8px', background: '#ef4444', color: '#fff',
                    fontSize: '0.65rem', fontWeight: 'bold', padding: '1px 6px', borderRadius: '10px'
                  }}>
                    MỚI
                  </span>
                )}

                <div style={{
                  width: '55px', height: '55px', borderRadius: '12px', overflow: 'hidden',
                  display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.3)'
                }}>
                  {res.item.img ? (
                    <img src={res.item.img} alt={res.item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '30px' }}>{res.item.icon}</span>
                  )}
                </div>

                <span style={{ 
                  fontSize: '0.78rem', fontWeight: 'bold', textAlign: 'center', 
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%',
                  color: rarityInfo.color 
                }}>
                  {res.item.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
          <button 
            className="btn-cute" 
            style={{ flex: 1, background: 'rgba(255,255,255,0.15)', fontSize: '0.95rem' }}
            onClick={onClose}
          >
            Thu Tất Cả Vào Kho 🎒
          </button>

          <button 
            className="btn-cute" 
            style={{ flex: 1.2, background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', fontWeight: 800, fontSize: '0.95rem' }}
            onClick={onRipAgain}
          >
            Xé Tiếp {multiResults.length} Lần ({bag.cost * multiResults.length} xu) ✂️
          </button>
        </div>

      </div>
    </div>
  );
};
