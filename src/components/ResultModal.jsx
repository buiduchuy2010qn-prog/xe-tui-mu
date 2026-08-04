import React from 'react';
import { ITEM_RARITIES } from '../data/items';

export const ResultModal = ({ 
  resultData, 
  onClose, 
  onRipAgain, 
  onOpenInventory 
}) => {
  if (!resultData) return null;

  const { item, isNew, totalCount } = resultData;
  const rarityInfo = ITEM_RARITIES[item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;

  return (
    <div style={{
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0,
      background: 'rgba(0,0,0,0.85)', 
      backdropFilter: 'blur(14px)',
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      zIndex: 1000, 
      padding: '1.2rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        padding: '2rem', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
        maxWidth: '440px', 
        width: '100%', 
        border: `2px solid ${rarityInfo.border}`,
        boxShadow: `0 20px 60px rgba(0,0,0,0.7), 0 0 30px ${rarityInfo.border}50`,
        position: 'relative',
        borderRadius: '28px'
      }}>
        
        {/* New Badge */}
        {isNew && (
          <div style={{
            position: 'absolute',
            top: '-14px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.8rem',
            padding: '4px 16px',
            borderRadius: '20px',
            boxShadow: '0 4px 15px rgba(239,68,68,0.6)',
            letterSpacing: '1px'
          }}>
            🌟 VẬT PHẨM MỚI! 🌟
          </div>
        )}

        <h2 style={{ fontSize: '1.6rem', color: '#fff', textAlign: 'center', marginTop: isNew ? '6px' : '0' }}>
          🎉 TRÚNG VẬT PHẨM! 🎉
        </h2>

        {/* Item Image / Icon */}
        <div style={{
          width: '160px',
          height: '160px',
          borderRadius: '24px',
          background: rarityInfo.bg,
          border: `2px solid ${rarityInfo.border}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${rarityInfo.border}40`,
          position: 'relative'
        }}>
          {item.img ? (
            <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '85px', filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))' }}>
              {item.icon}
            </span>
          )}

          {!isNew && (
            <span style={{
              position: 'absolute',
              bottom: '8px',
              right: '8px',
              background: 'rgba(0,0,0,0.75)',
              color: '#38bdf8',
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '0.75rem',
              fontWeight: 'bold'
            }}>
              +1
            </span>
          )}
        </div>

        {/* Details */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h3 className={rarityInfo.rarityClass} style={{ fontSize: '1.7rem', fontWeight: 800, margin: '4px 0' }}>
            {item.name}
          </h3>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', alignItems: 'center', margin: '6px 0' }}>
            <span style={{
              background: rarityInfo.bg,
              color: rarityInfo.color,
              border: `1px solid ${rarityInfo.border}`,
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: 800,
              textTransform: 'uppercase'
            }}>
              Độ hiếm: {rarityInfo.name}
            </span>

            <span style={{
              background: 'rgba(255,255,255,0.1)',
              color: '#cbd5e1',
              padding: '2px 10px',
              borderRadius: '12px',
              fontSize: '0.8rem'
            }}>
              Sở hữu: {totalCount}
            </span>
          </div>

          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '8px', lineHeight: '1.4', fontStyle: 'italic' }}>
            "{item.desc}"
          </p>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', width: '100%', marginTop: '0.4rem' }}>
          <button 
            className="btn-cute" 
            onClick={onRipAgain} 
            style={{ width: '100%', fontSize: '1.05rem', background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', fontWeight: 800 }}
          >
            ✂️ Xé Tiếp
          </button>
          
          <div style={{ display: 'flex', gap: '0.6rem', width: '100%' }}>
            <button 
              className="btn-cute" 
              onClick={onOpenInventory} 
              style={{ flex: 1, fontSize: '0.9rem', background: 'rgba(255,255,255,0.15)' }}
            >
              🎒 Xem Kho Đồ
            </button>
            
            <button 
              className="btn-cute" 
              onClick={onClose} 
              style={{ flex: 1, fontSize: '0.9rem', background: 'rgba(255,255,255,0.1)' }}
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
