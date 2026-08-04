import React, { useRef } from 'react';

export const SettingsModal = ({ 
  settings, 
  performanceMode,
  onToggleSound, 
  onToggleParticles, 
  onChangePerformanceMode,
  onResetData,
  onExportSave,
  onImportSave,
  onOpenTutorial,
  onOpenAdminSim,
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
        width: '100%', maxWidth: '520px', maxHeight: '90vh', padding: '1.8rem',
        display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(24,24,36,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(255,255,255,0.2)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>⚙️ CÀI ĐẶT GAME</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Options */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          
          {/* Sound Toggle */}
          <div className="glass-panel" style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>🔊 Âm Thanh Game</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Tiếng xé túi và hiệu ứng trúng thưởng</p>
            </div>
            <button 
              className="btn-cute" 
              style={{ background: settings.sound ? '#10b981' : '#475569', fontSize: '0.8rem', padding: '6px 14px' }}
              onClick={onToggleSound}
            >
              {settings.sound ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
            </button>
          </div>

          {/* Particles Toggle */}
          <div className="glass-panel" style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>✨ Hiệu Ứng Pháo Giấy</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Hạt màu nổ rực rỡ khi mở đồ</p>
            </div>
            <button 
              className="btn-cute" 
              style={{ background: settings.particles ? '#10b981' : '#475569', fontSize: '0.8rem', padding: '6px 14px' }}
              onClick={onToggleParticles}
            >
              {settings.particles ? 'ĐANG BẬT' : 'ĐÃ TẮT'}
            </button>
          </div>

          {/* Performance Preset */}
          <div className="glass-panel" style={{ padding: '0.8rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px', background: 'rgba(255,255,255,0.04)' }}>
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>⚡ Chế Độ Hiệu Năng</h4>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Dành cho máy yếu hoặc tiết kiệm pin</p>
            </div>
            <select
              value={performanceMode}
              onChange={(e) => onChangePerformanceMode(e.target.value)}
              style={{ padding: '6px 10px', borderRadius: '12px', background: '#1e1b4b', color: '#fff', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.2)' }}
            >
              <option value="auto">Tự động</option>
              <option value="high">Chất lượng cao</option>
              <option value="balanced">Cân bằng</option>
              <option value="low">Máy yếu</option>
            </select>
          </div>

        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          
          <button 
            className="btn-cute" 
            style={{ width: '100%', background: 'rgba(255,255,255,0.15)', fontSize: '0.85rem' }}
            onClick={onOpenTutorial}
          >
            ❓ Xem Lại Hướng Dẫn Tân Thủ
          </button>

          <button 
            className="btn-cute" 
            style={{ width: '100%', background: 'rgba(16,185,129,0.2)', border: '1px solid #10b981', color: '#34d399', fontSize: '0.85rem' }}
            onClick={onOpenAdminSim}
          >
            🛠️ Công Cụ Mô Phỏng Tỷ Lệ (Dev Simulator)
          </button>

          <div style={{ display: 'flex', gap: '0.8rem' }}>
            <button 
              className="btn-cute" 
              style={{ flex: 1, background: 'rgba(255,255,255,0.12)', fontSize: '0.8rem' }}
              onClick={onExportSave}
            >
              💾 Xuất File Save (JSON)
            </button>

            <button 
              className="btn-cute" 
              style={{ flex: 1, background: 'rgba(255,255,255,0.12)', fontSize: '0.8rem' }}
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
            style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', fontSize: '0.85rem', marginTop: '0.3rem' }}
            onClick={() => {
              if (window.confirm('⚠️ Bạn có chắc chắn muốn XÓA TOÀN BỘ TIẾN TRÌNH và chơi lại từ đầu không?')) {
                onResetData();
              }
            }}
          >
            🗑️ Reset Dữ Liệu & Chơi Lại Từ Đầu
          </button>
        </div>

        {/* Version Info & Changelog */}
        <div style={{ textAlign: 'center', fontSize: '0.75rem', color: '#64748b', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.8rem' }}>
          <div>Xé Túi Mù Vô Tri v2.5 (Built-in Web Audio & PWA)</div>
          <div>Cập nhật: {new Date().toLocaleDateString('vi-VN')}</div>
        </div>

      </div>
    </div>
  );
};
