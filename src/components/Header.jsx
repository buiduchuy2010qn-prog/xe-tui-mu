import React from 'react';

export const Header = ({ 
  coins, 
  inventoryCount, 
  totalItemsCount,
  onOpenInventory, 
  onOpenQuests, 
  onOpenAchievements, 
  onOpenSettings,
  soundEnabled,
  onToggleSound
}) => {
  return (
    <header className="glass-panel" style={{ padding: '0.8rem 1.5rem', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1100px', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      
      {/* Title & Branding */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <span className="floating" style={{ fontSize: '2.2rem', filter: 'drop-shadow(0 4px 10px rgba(251,191,36,0.5))' }}>🎁</span>
        <div>
          <h1 style={{ 
            fontSize: '1.6rem', 
            fontWeight: 800, 
            background: 'linear-gradient(to right, #fbbf24, #f59e0b, #ec4899)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent',
            letterSpacing: '0.5px'
          }}>
            XÉ TÚI MÙ VÔ TRI
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Game vô tri • Săn báu vật hài hước!</p>
        </div>
      </div>

      {/* Stats & Actions */}
      <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
        
        {/* Coin Display */}
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(217,119,6,0.2) 100%)', 
          border: '1px solid rgba(251,191,36,0.4)',
          padding: '8px 16px', 
          borderRadius: '30px', 
          fontSize: '1.15rem', 
          fontWeight: 'bold',
          color: '#fbbf24',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 12px rgba(251,191,36,0.2)'
        }}>
          💰 <span>{coins}</span> Xu
        </div>

        {/* Quests Button */}
        <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '8px 14px', fontSize: '0.85rem' }} onClick={onOpenQuests}>
          📋 Nhiệm Vụ
        </button>

        {/* Inventory Button */}
        <button className="btn-cute" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={onOpenInventory}>
          🎒 Kho Đồ ({inventoryCount}/{totalItemsCount})
        </button>

        {/* Achievements Button */}
        <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '8px 14px', fontSize: '0.85rem' }} onClick={onOpenAchievements}>
          🏆 Thành Tích
        </button>

        {/* Sound Quick Toggle */}
        <button 
          onClick={onToggleSound} 
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            color: 'white', 
            borderRadius: '50%', 
            width: '38px', 
            height: '38px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s ease'
          }}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Settings Button */}
        <button 
          onClick={onOpenSettings}
          style={{ 
            background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', 
            color: 'white', 
            borderRadius: '50%', 
            width: '38px', 
            height: '38px',
            fontSize: '1.1rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Cài đặt"
        >
          ⚙️
        </button>

      </div>

    </header>
  );
};
