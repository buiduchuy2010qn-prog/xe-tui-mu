import React, { useState } from 'react';
import { getExpForLevel } from '../utils/level';
import { SHOP_ITEMS } from '../data/shop';

const AVATARS = ['🐱', '🐻', '🐰', '👑', '🗿', '💸', '🦄', '👽', '🎃', '🤖'];

export const ProfileModal = ({ 
  profile, 
  level, 
  exp, 
  coins,
  shards,
  stats, 
  unlockedCount,
  totalCount,
  shopOwned,
  itemsMap,
  onUpdateProfile, 
  onClose 
}) => {
  const [name, setName] = useState(profile.playerName || 'Tập Sự Vô Tri');
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatar || '🐱');
  const [selectedTitle, setSelectedTitle] = useState(profile.title || 'Tập Sự Vô Tri 🎒');
  const [selectedFrame, setSelectedFrame] = useState(profile.frame || null);

  const reqExp = getExpForLevel(level);
  const expPercent = Math.min(100, Math.round((exp / reqExp) * 100));

  const ownedFrames = SHOP_ITEMS.filter(i => i.category === 'frame' && shopOwned.includes(i.id));
  const ownedTitles = SHOP_ITEMS.filter(i => i.category === 'title' && shopOwned.includes(i.id));

  const currentFrameObj = SHOP_ITEMS.find(i => i.id === selectedFrame);

  const handleSave = () => {
    onUpdateProfile({
      playerName: name.trim() || 'Tập Sự Vô Tri',
      avatar: selectedAvatar,
      title: selectedTitle,
      frame: selectedFrame
    });
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 950, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '540px', maxHeight: '90vh',
        padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(251,191,36,0.3)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fbbf24' }}>👤 HỒ SƠ NGƯỜI CHƠI</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Profile Card Preview */}
        <div className="glass-panel" style={{
          padding: '1.2rem', display: 'flex', alignItems: 'center', gap: '1.2rem',
          background: 'rgba(255,255,255,0.06)', borderRadius: '20px',
          border: currentFrameObj ? currentFrameObj.style : '1px solid rgba(255,255,255,0.15)',
          boxShadow: currentFrameObj ? currentFrameObj.glow : 'none'
        }}>
          <div style={{
            fontSize: '55px', width: '85px', height: '85px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            {selectedAvatar}
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ background: '#fbbf24', color: '#000', fontWeight: 800, fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px' }}>
                Lv.{level}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#ec4899', fontWeight: 'bold' }}>
                {selectedTitle}
              </span>
            </div>

            <h3 style={{ fontSize: '1.3rem', fontWeight: 'bold', margin: '4px 0' }}>{name}</h3>

            {/* EXP Bar */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', display: 'flex', justifyContent: 'space-between' }}>
                <span>Kinh nghiệm</span>
                <span>{exp}/{reqExp} EXP ({expPercent}%)</span>
              </div>
              <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', marginTop: '3px', overflow: 'hidden' }}>
                <div style={{ width: `${expPercent}%`, height: '100%', background: '#fbbf24' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Edit Name */}
        <div>
          <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
            Tên người chơi:
          </label>
          <input 
            type="text" 
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px', borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)',
              color: '#fff', fontSize: '0.95rem', outline: 'none'
            }}
          />
        </div>

        {/* Select Avatar */}
        <div>
          <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
            Chọn Avatar:
          </label>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {AVATARS.map((av) => (
              <button
                key={av}
                onClick={() => setSelectedAvatar(av)}
                style={{
                  fontSize: '28px', padding: '6px', borderRadius: '12px',
                  background: selectedAvatar === av ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)',
                  border: selectedAvatar === av ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                  cursor: 'pointer'
                }}
              >
                {av}
              </button>
            ))}
          </div>
        </div>

        {/* Select Frame */}
        {ownedFrames.length > 0 && (
          <div>
            <label style={{ fontSize: '0.85rem', color: '#cbd5e1', fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>
              Khung Hồ Sơ Đã Mua:
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setSelectedFrame(null)}
                style={{
                  padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem',
                  background: selectedFrame === null ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)',
                  border: selectedFrame === null ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff', cursor: 'pointer'
                }}
              >
                Mặc định
              </button>
              {ownedFrames.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedFrame(f.id)}
                  style={{
                    padding: '6px 12px', borderRadius: '12px', fontSize: '0.8rem',
                    background: selectedFrame === f.id ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)',
                    border: selectedFrame === f.id ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                    color: '#fff', cursor: 'pointer'
                  }}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
          <div className="glass-panel" style={{ padding: '0.8rem', textAlign: 'center', background: 'rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Đã xé túi</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{stats.totalOpened || 0} lần</h4>
          </div>
          <div className="glass-panel" style={{ padding: '0.8rem', textAlign: 'center', background: 'rgba(255,255,255,0.04)' }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Mảnh Vô Tri</span>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>{shards} mảnh</h4>
          </div>
        </div>

        <button className="btn-cute" onClick={handleSave} style={{ width: '100%', marginTop: '0.4rem' }}>
          Lưu Thay Đổi 💾
        </button>

      </div>
    </div>
  );
};
