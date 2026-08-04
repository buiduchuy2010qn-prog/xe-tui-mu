import React from 'react';
import { COLLECTIONS } from '../data/collections';

export const CollectionsModal = ({ itemsMap, achievementsMap, onClaimCollection, onClose }) => {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 950, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '750px', maxHeight: '90vh',
        padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(251,191,36,0.4)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>📚 BỘ SƯU TẬP THEO CHỦ ĐỀ</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Gom đủ bộ để nhận ngay thưởng lớn và danh hiệu!</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Collections List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {COLLECTIONS.map((col) => {
            const colItems = col.items.map(id => itemsMap[id]).filter(Boolean);
            const unlockedInCol = colItems.filter(i => i.unlocked).length;
            const isCompleted = unlockedInCol === colItems.length;

            return (
              <div 
                key={col.id}
                className="glass-panel"
                style={{
                  padding: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.8rem',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                  border: isCompleted ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', color: col.color }}>{col.title}</h3>
                    <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>{col.desc}</p>
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: isCompleted ? '#34d399' : '#94a3b8' }}>
                    {unlockedInCol}/{colItems.length}
                  </span>
                </div>

                {/* Items Row */}
                <div style={{ display: 'flex', gap: '0.8rem', overflowX: 'auto', paddingBottom: '4px' }}>
                  {colItems.map((item) => (
                    <div 
                      key={item.id}
                      style={{
                        minWidth: '60px', height: '60px', borderRadius: '12px',
                        background: item.unlocked ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.4)',
                        border: item.unlocked ? `1px solid ${col.color}` : '1px dashed rgba(255,255,255,0.1)',
                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                        opacity: item.unlocked ? 1 : 0.4
                      }}
                      title={item.name}
                    >
                      {item.unlocked ? (
                        item.img ? (
                          <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                        ) : (
                          <span style={{ fontSize: '28px' }}>{item.icon}</span>
                        )
                      ) : (
                        <span style={{ fontSize: '20px' }}>🔒</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Reward info & Button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '8px 12px', borderRadius: '12px' }}>
                  <span style={{ fontSize: '0.82rem', color: '#fbbf24' }}>
                    Thưởng: 💰 +{col.rewardCoins} Xu & Danh hiệu "{col.rewardTitle}"
                  </span>

                  {isCompleted && (
                    <span style={{ fontSize: '0.8rem', color: '#34d399', fontWeight: 'bold' }}>
                      ✓ Đã Hoàn Thành!
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
