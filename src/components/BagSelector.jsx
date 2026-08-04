import React from 'react';
import { BAGS } from '../data/bags';

export const BagSelector = ({ 
  selectedBagId, 
  onSelectBag, 
  onRipBag, 
  onSkipAnimation,
  isOpening, 
  coins,
  playerLevel,
  pityMap
}) => {
  return (
    <section style={{ width: '100%', maxWidth: '1200px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: '#f8fafc', fontWeight: 800 }}>
          🛍️ BỘ SƯU TẬP TÚI MÙ VÔ TRI 🛍️
        </h2>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '4px' }}>
          Chọn túi mù yêu thích, trải nghiệm cảm giác xé bao bì và săn vật phẩm hiếm!
        </p>
      </div>

      {/* Skip Animation Overlay Button (Appears during unboxing) */}
      {isOpening && (
        <button 
          className="btn-cute animate-pop-in"
          style={{
            position: 'fixed',
            bottom: '40px',
            zIndex: 1200,
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            fontSize: '1rem',
            padding: '12px 30px',
            boxShadow: '0 8px 25px rgba(239,68,68,0.6)'
          }}
          onClick={onSkipAnimation}
        >
          ⏩ Bỏ Qua Animation
        </button>
      )}

      {/* Bags Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', 
        gap: '1.5rem', 
        width: '100%' 
      }}>
        {BAGS.map((bag) => {
          const isSelected = selectedBagId === bag.id;
          const isOpeningThis = isOpening && isSelected;
          const isUnlocked = playerLevel >= bag.minLevel;
          const bagPity = pityMap[bag.id] || { rare: 0, epic: 0 };

          return (
            <div 
              key={bag.id}
              className={`glass-panel ${isOpeningThis ? 'animate-shake' : isUnlocked ? 'floating' : ''}`}
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1rem',
                background: !isUnlocked 
                  ? 'rgba(0,0,0,0.4)' 
                  : isSelected 
                  ? bag.color 
                  : 'rgba(255,255,255,0.05)',
                border: !isUnlocked
                  ? '1px dashed rgba(255,255,255,0.1)'
                  : isSelected 
                  ? `2px solid ${bag.borderColor}` 
                  : '1px solid rgba(255,255,255,0.12)',
                boxShadow: isSelected && isUnlocked
                  ? `0 12px 30px rgba(0,0,0,0.4), 0 0 20px ${bag.borderColor}40` 
                  : '0 8px 20px rgba(0,0,0,0.2)',
                borderRadius: '24px',
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                cursor: isOpening || !isUnlocked ? 'default' : 'pointer',
                position: 'relative',
                opacity: isUnlocked ? 1 : 0.6
              }}
              onClick={() => {
                if (!isOpening && isUnlocked) onSelectBag(bag.id);
              }}
            >
              {/* Badge & Lock status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
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

                {!isUnlocked ? (
                  <span style={{ background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>
                    🔒 Cần Lv.{bag.minLevel}
                  </span>
                ) : isSelected && (
                  <span style={{ background: bag.borderColor, color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 800 }}>
                    ĐANG CHỌN
                  </span>
                )}
              </div>

              {/* Bag Image / Icon */}
              <div style={{
                width: '130px',
                height: '150px',
                borderRadius: '20px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.15)',
                boxShadow: 'inset 0 0 15px rgba(255,255,255,0.2), 0 8px 20px rgba(0,0,0,0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {!isUnlocked ? (
                  <span style={{ fontSize: '65px' }}>🔒</span>
                ) : bag.img ? (
                  <img src={bag.img} alt={bag.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '70px', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}>
                    {bag.icon}
                  </span>
                )}
              </div>

              {/* Details */}
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '4px' }}>{bag.name}</h3>
                <p style={{ fontSize: '0.78rem', color: isSelected ? 'rgba(255,255,255,0.9)' : '#94a3b8', lineHeight: '1.3' }}>
                  {bag.desc}
                </p>

                {/* Pity Progress Counters */}
                {isUnlocked && (
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px', fontSize: '0.7rem' }}>
                    <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '6px', color: '#38bdf8' }}>
                      Bảo hiểm Hiếm: {bagPity.rare}/{bag.pityRareMax}
                    </span>
                    <span style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '6px', color: '#c084fc' }}>
                      Sử Thi: {bagPity.epic}/{bag.pityEpicMax}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Rip Buttons: 1x, 5x, 10x */}
              {isUnlocked && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', marginTop: 'auto' }}>
                  <button
                    className="btn-cute"
                    style={{
                      width: '100%',
                      background: isSelected ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' : 'rgba(255,255,255,0.15)',
                      color: isSelected ? '#000' : '#fff',
                      fontWeight: 800,
                      fontSize: '0.95rem'
                    }}
                    disabled={isOpening || coins < bag.cost}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectBag(bag.id);
                      onRipBag(bag, 1);
                    }}
                  >
                    Xé 1 Lần ({bag.cost} xu)
                  </button>

                  <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                    <button
                      className="btn-cute"
                      style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)' }}
                      disabled={isOpening || coins < bag.cost * 5}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBag(bag.id);
                        onRipBag(bag, 5);
                      }}
                    >
                      Xé 5x ({bag.cost * 5} xu)
                    </button>

                    <button
                      className="btn-cute"
                      style={{ flex: 1, padding: '6px', fontSize: '0.8rem', background: 'rgba(255,255,255,0.2)' }}
                      disabled={isOpening || coins < bag.cost * 10}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectBag(bag.id);
                        onRipBag(bag, 10);
                      }}
                    >
                      Xé 10x ({bag.cost * 10} xu)
                    </button>
                  </div>
                </div>
              )}

            </div>
          );
        })}
      </div>

    </section>
  );
};
