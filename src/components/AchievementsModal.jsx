import React from 'react';

export const AchievementsModal = ({ achievementsMap, onClose }) => {
  const achList = Object.values(achievementsMap);
  const unlockedCount = achList.filter(a => a.unlocked).length;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 900, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '600px', maxHeight: '90vh',
        padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(139,92,246,0.4)'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#c084fc' }}>🏆 THÀNH TÍCH VÔ TRI</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Đã mở khóa: <strong>{unlockedCount}/{achList.length}</strong> danh hiệu
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {achList.map((ach) => (
            <div 
              key={ach.id}
              className="glass-panel"
              style={{
                padding: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: ach.unlocked ? 'rgba(192,132,252,0.12)' : 'rgba(255,255,255,0.03)',
                border: ach.unlocked ? '1px solid rgba(192,132,252,0.4)' : '1px dashed rgba(255,255,255,0.1)',
                borderRadius: '18px',
                opacity: ach.unlocked ? 1 : 0.5
              }}
            >
              <div style={{
                width: '50px', height: '50px', borderRadius: '14px',
                background: ach.unlocked ? 'rgba(192,132,252,0.2)' : 'rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                fontSize: '26px'
              }}>
                {ach.unlocked ? ach.icon : '🔒'}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: ach.unlocked ? '#f8fafc' : '#94a3b8' }}>
                  {ach.title}
                </h4>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{ach.desc}</p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#fbbf24' }}>
                  +${ach.reward} Xu
                </span>
                {ach.unlocked && (
                  <div style={{ fontSize: '0.7rem', color: '#34d399', marginTop: '2px' }}>
                    ✓ Đã nhận
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
