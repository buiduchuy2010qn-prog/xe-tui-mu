import React, { useRef } from 'react';

export const SettingsModal = ({ 
  settings, 
  onToggleSound, 
  onToggleParticles, 
  onResetData,
  onExportSave,
  onImportSave,
  onClose 
}) => {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (content && typeof content === 'string') {
        onImportSave(content);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 950, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '480px', padding: '1.8rem',
        display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(24,24,36,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(255,255,255,0.2)'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>⚙️ CÀI ĐẶT GAME</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Toggle options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          {/* Sound Toggle */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>🔊 Âm Thanh Game</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Bật/Tắt tiếng xé túi và hiệu ứng trúng thưởng</p>
            </div>
            <button 
              className="btn-cute" 
              style={{ background: settings.sound ? '#10b981' : '#475569', fontSize: '0.85rem', padding: '6px 16px' }}
              onClick={onToggleSound}
            >
              {settings.sound ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
            </button>
          </div>

          {/* Particles Toggle */}
          <div className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>✨ Hiệu Ứng Pháo Giấy</h4>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Giảm hiệu ứng để mượt hơn trên máy yếu</p>
            </div>
            <button 
              className="btn-cute" 
              style={{ background: settings.particles ? '#10b981' : '#475569', fontSize: '0.85rem', padding: '6px 16px' }}
              onClick={onToggleParticles}
            >
              {settings.particles ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
            </button>
          </div>

        </div>

        {/* Save Data Management */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '0.5rem' }}>
          <h4 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase' }}>Quản lý dữ liệu lưu trữ</h4>
          
          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button 
              className="btn-cute" 
              style={{ flex: 1, background: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}
              onClick={onExportSave}
            >
              💾 Xuất File Save (JSON)
            </button>

            <button 
              className="btn-cute" 
              style={{ flex: 1, background: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}
              onClick={() => fileInputRef.current?.click()}
            >
              📂 Nhập File Save
            </button>

            <input 
              type="file" 
              accept=".json"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>

          <button 
            className="btn-cute" 
            style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', fontSize: '0.9rem', marginTop: '0.5rem' }}
            onClick={() => {
              if (window.confirm('⚠️ Bạn có chắc chắn muốn XÓA TOÀN BỘ TIẾN TRÌNH và chơi lại từ đầu không? Hành động này không thể hoàn tác!')) {
                onResetData();
              }
            }}
          >
            🗑️ Xóa Tiến Trình & Chơi Lại Từ Đầu
          </button>
        </div>

      </div>
    </div>
  );
};
