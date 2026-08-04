import React from 'react';

export const RecycleModal = ({ 
  itemsMap, 
  shards, 
  onDeconstructItem, 
  onDeconstructAll, 
  onExchangeShards, 
  onClose 
}) => {
  const duplicatesList = Object.values(itemsMap).filter(i => i.unlocked && i.count > 1);
  const totalExtraCount = duplicatesList.reduce((sum, item) => sum + (item.count - 1), 0);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 950, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '650px', maxHeight: '90vh',
        padding: '1.8rem', display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(15,23,42,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(56,189,248,0.4)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#38bdf8' }}>♻️ PHÂN GIẢI ĐỒ TRÙNG</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Số mảnh hiện có: <strong style={{ color: '#38bdf8' }}>{shards} Mảnh Vô Tri</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Exchange Shards Banner */}
        <div className="glass-panel" style={{
          padding: '1rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '16px', flexWrap: 'wrap', gap: '0.8rem'
        }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#7dd3fc' }}>✨ Đổi Mảnh Lấy Túi Mù</h4>
            <p style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>10 Mảnh ➔ Túi Rác | 50 Mảnh ➔ Túi Nilon</p>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button 
              className="btn-cute" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', background: shards >= 10 ? '#0284c7' : '#475569' }}
              disabled={shards < 10}
              onClick={() => onExchangeShards('trash_bag', 10)}
            >
              Đổi Túi Rác (10 mảnh)
            </button>
            <button 
              className="btn-cute" 
              style={{ padding: '6px 12px', fontSize: '0.8rem', background: shards >= 50 ? '#0284c7' : '#475569' }}
              disabled={shards < 50}
              onClick={() => onExchangeShards('nylon_bag', 50)}
            >
              Đổi Túi Nilon (50 mảnh)
            </button>
          </div>
        </div>

        {/* Deconstruct All Action */}
        {totalExtraCount > 0 && (
          <button 
            className="btn-cute"
            style={{ width: '100%', background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)', fontSize: '0.9rem' }}
            onClick={() => {
              if (window.confirm(`Xác nhận phân giải tất cả ${totalExtraCount} vật phẩm trùng để nhận ${totalExtraCount * 10} Mảnh Vô Tri?`)) {
                onDeconstructAll();
              }
            }}
          >
            ♻️ Phân Giải Tất Cả ({totalExtraCount} đồ trùng ➔ +{totalExtraCount * 10} Mảnh)
          </button>
        )}

        {/* Duplicates List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {duplicatesList.map((item) => {
            const extraCount = item.count - 1;

            return (
              <div 
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '0.8rem 1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '45px', height: '45px', borderRadius: '12px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    {item.img ? (
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '26px' }}>{item.icon}</span>
                    )}
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold' }}>{item.name}</h4>
                    <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Dư: x{extraCount} bản trùng</span>
                  </div>
                </div>

                <button 
                  className="btn-cute" 
                  style={{ padding: '6px 14px', fontSize: '0.8rem', background: 'rgba(56,189,248,0.2)', border: '1px solid #38bdf8', color: '#38bdf8' }}
                  onClick={() => {
                    if (window.confirm(`Phân giải 1 bản trùng "${item.name}" để nhận 10 Mảnh Vô Tri?`)) {
                      onDeconstructItem(item.id);
                    }
                  }}
                >
                  Phân Giải (+10 Mảnh)
                </button>
              </div>
            );
          })}

          {duplicatesList.length === 0 && (
            <div style={{ textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
              Bạn chưa có vật phẩm trùng nào để phân giải. 📦
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
