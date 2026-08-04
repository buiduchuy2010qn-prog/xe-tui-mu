import React, { useState, useEffect } from 'react';

export const QuestsModal = ({ 
  questsMap, 
  onClaimQuest, 
  lastFreeClaimTime, 
  onClaimFreeCoins, 
  onClose 
}) => {
  const [timeLeft, setTimeLeft] = useState(0);
  const cooldownSec = 120; // 2 minutes cooldown for free coins

  useEffect(() => {
    const updateCooldown = () => {
      const now = Date.now();
      const elapsed = Math.floor((now - lastFreeClaimTime) / 1000);
      const remaining = Math.max(0, cooldownSec - elapsed);
      setTimeLeft(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);
    return () => clearInterval(interval);
  }, [lastFreeClaimTime]);

  const questList = Object.values(questsMap);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 900, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '550px', maxHeight: '90vh',
        padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(24,24,36,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(16,185,129,0.3)'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10b981' }}>📋 NHIỆM VỤ & THƯỞNG</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Hoàn thành nhiệm vụ để tích lũy xu xé túi!</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Free Coins Box */}
        <div className="glass-panel" style={{
          padding: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.1) 100%)',
          border: '1px solid rgba(16,185,129,0.4)', borderRadius: '20px'
        }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#34d399' }}>🎁 Nhận Xu Miễn Phí</h3>
            <p style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>Cấp vốn +100 xu mỗi 2 phút!</p>
          </div>

          <button 
            className="btn-cute"
            style={{ background: timeLeft === 0 ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : '#475569', fontSize: '0.85rem' }}
            disabled={timeLeft > 0}
            onClick={onClaimFreeCoins}
          >
            {timeLeft > 0 ? `Chờ ${timeLeft}s` : 'Nhận +100 Xu 💰'}
          </button>
        </div>

        {/* Quests List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {questList.map((quest) => {
            const isCompleted = quest.progress >= quest.target;

            return (
              <div 
                key={quest.id} 
                className="glass-panel"
                style={{
                  padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ flex: 1, paddingRight: '1rem' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '4px' }}>{quest.name}</h4>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span>Tiến độ: {Math.min(quest.progress, quest.target)}/{quest.target}</span>
                    <span style={{ color: '#fbbf24', fontWeight: 'bold' }}>+${quest.reward} Xu</span>
                  </div>

                  {/* Quest Bar */}
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%`, height: '100%', background: '#10b981' }} />
                  </div>
                </div>

                <button 
                  className="btn-cute"
                  style={{
                    fontSize: '0.8rem',
                    padding: '8px 14px',
                    background: quest.claimed 
                      ? '#334155' 
                      : isCompleted 
                      ? 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)' 
                      : '#475569',
                    color: quest.claimed ? '#94a3b8' : isCompleted ? '#000' : '#fff',
                    fontWeight: isCompleted ? 'bold' : 'normal'
                  }}
                  disabled={!isCompleted || quest.claimed}
                  onClick={() => onClaimQuest(quest.id)}
                >
                  {quest.claimed ? 'Đã Nhận' : isCompleted ? 'Nhận Thưởng' : 'Chưa Xong'}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
