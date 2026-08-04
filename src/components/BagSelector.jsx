import React from 'react';
import { BAGS } from '../data/bags';

export const BagSelector = ({ 
  selectedBagId, 
  onSelectBag, 
  onRipBag, 
  isOpening, 
  coins 
}) => {
  return (
    <section style={{ width: '100%', maxWidth: '1100px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#f8fafc', fontWeight: 700 }}>
          🛍️ CHỌN TÚI MÙ VÔ TRI BẠN MUỐN XÉ 🛍️
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
          Mỗi túi mang lại những trải nghiệm và tỷ lệ đồ hiếm khác nhau!
        </p>
      </div>

      {/* Bags Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
        gap: '1.5rem', 
        width: '100%' 
      }}>
        {BAGS.map((bag) => {
          const isSelected = selectedBagId === bag.id;
          const isOpeningThis = isOpening && isSelected;
          const canAfford = coins >= bag.cost;

          return (
            <div 
              key={bag.id}
              className={`glass-panel ${isOpeningThis ? 'animate-shake' : 'floating'}`}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                background: isSelected 
                  ? bag.color 
                  : 'rgba(255,255,255,0.05)',
                border: isSelected 
                  ? `2px solid ${bag.borderColor}` 
                  : '1px solid rgba(255,255,255,0.12)',
                boxShadow: isSelected 
                  ? `0 12px 30px rgba(0,0,0,0.4), 0 0 20px ${bag.borderColor}40` 
                  : '0 8px 20px rgba(0,0,0,0.2)',
                borderRadius: '24px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: isOpening ? 'default' : 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={() => {
                if (!isOpening) onSelectBag(bag.id);
              }}
            >
              {/* Badge */}
              <div style={{
                display: 'flex',
                justify: 'space-between',
                width: '100%',
                alignItems: 'center'
              }}>
                <span style={{
                  background: 'rgba(0,0,0,0.4)',
                  backdropFilter: 'blur(4px)',
                  color: bag.borderColor,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 'bold',
                  border: `1px solid ${bag.borderColor}60`
                }}>
                  {bag.badge}
                </span>

                {isSelected && (
                  <span style={{
                    background: bag.borderColor,
                    color: '#000',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 800
                  }}>
                    ĐANG CHỌN
                  </span>
                )}
              </div>

              {/* Bag Image / Icon */}
              <div style={{
                width: '140px',
                height: '160px',
                borderRadius: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.15)',
                boxShadow: 'inset 0 0 15px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                {bag.img ? (
                  <img 
                    src={bag.img} 
                    alt={bag.name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <span style={{ fontSize: '75px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                    {bag.icon}
                  </span>
                )}
              </div>

              {/* Information */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '4px' }}>
                  {bag.name}
                </h3>
                <p style={{ fontSize: '0.8rem', color: isSelected ? 'rgba(255,255,255,0.9)' : '#94a3b8', lineHeight: '1.3' }}>
                  {bag.desc}
                </p>
                <div style={{ 
                  marginTop: '8px', 
                  fontSize: '0.72rem', 
                  color: bag.borderColor, 
                  fontWeight: 600,
                  background: 'rgba(0,0,0,0.2)',
                  padding: '4px 8px',
                  borderRadius: '8px'
                }}>
                  📊 {bag.ratesDesc}
                </div>
              </div>

              {/* Rip Button */}
              <button
                className="btn-cute"
                style={{
                  width: '100%',
                  marginTop: 'auto',
                  background: isSelected 
                    ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' 
                    : 'rgba(255,255,255,0.15)',
                  color: isSelected ? '#000' : '#fff',
                  fontWeight: 800,
                  boxShadow: isSelected ? '0 6px 20px rgba(251,191,36,0.5)' : 'none'
                }}
                disabled={isOpening || !canAfford}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectBag(bag.id);
                  onRipBag(bag);
                }}
              >
                {isOpeningThis ? 'Đang Xé... ✂️' : `Xé Ngay (${bag.cost} xu)`}
              </button>

            </div>
          );
        })}
      </div>

    </section>
  );
};
