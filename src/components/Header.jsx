import React from 'react';
import { getExpForLevel } from '../utils/level';

export const Header = ({ 
  coins, 
  shards,
  level,
  exp,
  profile,
  inventoryCount, 
  totalItemsCount,
  onOpenProfile,
  onOpenShop,
  onOpenCollections,
  onOpenInventory, 
  onOpenRecycle,
  onOpenQuests, 
  onOpenAchievements, 
  onOpenHistory,
  onOpenSettings,
  soundEnabled,
  onToggleSound
}) => {
  const reqExp = getExpForLevel(level);
  const expPercent = Math.min(100, Math.round((exp / reqExp) * 100));

  return (
    <header className="glass-panel" style={{ padding: '0.8rem 1.4rem', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1200px', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
      
      {/* Profile & Level Display */}
      <div 
        onClick={onOpenProfile}
        style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', cursor: 'pointer' }}
        title="Bấm vào để xem Hồ sơ & Đổi avatar"
      >
        <div style={{
          fontSize: '36px', width: '52px', height: '52px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          border: '2px solid rgba(251,191,36,0.5)', boxShadow: '0 0 10px rgba(251,191,36,0.3)'
        }}>
          {profile.avatar || '🐱'}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#fff' }}>
              {profile.playerName || 'Tập Sự Vô Tri'}
            </span>
            <span style={{ background: '#fbbf24', color: '#000', fontWeight: 800, fontSize: '0.7rem', padding: '1px 6px', borderRadius: '8px' }}>
              Lv.{level}
            </span>
          </div>

          {/* EXP Bar */}
          <div style={{ width: '140px', height: '6px', background: 'rgba(255,255,255,0.15)', borderRadius: '4px', marginTop: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${expPercent}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)' }} />
          </div>
        </div>
      </div>

      {/* Currency Balances */}
      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(251,191,36,0.2) 0%, rgba(217,119,6,0.2) 100%)', 
          border: '1px solid rgba(251,191,36,0.4)', padding: '6px 14px', borderRadius: '20px', 
          fontSize: '1rem', fontWeight: 'bold', color: '#fbbf24'
        }}>
          💰 <span>{coins}</span> Xu
        </div>

        <div style={{ 
          background: 'linear-gradient(135deg, rgba(56,189,248,0.2) 0%, rgba(2,132,199,0.2) 100%)', 
          border: '1px solid rgba(56,189,248,0.4)', padding: '6px 14px', borderRadius: '20px', 
          fontSize: '0.9rem', fontWeight: 'bold', color: '#38bdf8'
        }}>
          ✨ <span>{shards}</span> Mảnh
        </div>
      </div>

      {/* Action Buttons Nav Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        
        <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)', padding: '7px 12px', fontSize: '0.8rem' }} onClick={onOpenShop}>
          🏪 Shop
        </button>

        <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)', color: '#000', fontWeight: 800, padding: '7px 12px', fontSize: '0.8rem' }} onClick={onOpenCollections}>
          📚 Bộ Sưu Tập
        </button>

        <button className="btn-cute" style={{ padding: '7px 12px', fontSize: '0.8rem' }} onClick={onOpenInventory}>
          🎒 Kho ({inventoryCount}/{totalItemsCount})
        </button>

        <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', padding: '7px 12px', fontSize: '0.8rem' }} onClick={onOpenRecycle}>
          ♻️ Phân Giải
        </button>

        <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '7px 12px', fontSize: '0.8rem' }} onClick={onOpenQuests}>
          📋 Nhiệm Vụ
        </button>

        <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '7px 12px', fontSize: '0.8rem' }} onClick={onOpenAchievements}>
          🏆 Thành Tích
        </button>

        <button className="btn-cute" style={{ background: 'rgba(255,255,255,0.15)', padding: '7px 12px', fontSize: '0.8rem' }} onClick={onOpenHistory}>
          📜 Lịch Sử
        </button>

        {/* Sound Toggle */}
        <button 
          onClick={onToggleSound} 
          style={{ 
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', 
            borderRadius: '50%', width: '36px', height: '36px', fontSize: '1rem', cursor: 'pointer'
          }}
          title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Settings Button */}
        <button 
          onClick={onOpenSettings}
          style={{ 
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', 
            borderRadius: '50%', width: '36px', height: '36px', fontSize: '1rem', cursor: 'pointer'
          }}
          title="Cài đặt"
        >
          ⚙️
        </button>

      </div>

    </header>
  );
};
