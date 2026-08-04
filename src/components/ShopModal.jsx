import React, { useState } from 'react';
import { SHOP_ITEMS } from '../data/shop';

export const ShopModal = ({ coins, shopOwned, onBuyItem, onClose }) => {
  const [selectedCat, setSelectedCat] = useState('ALL');

  const filteredItems = SHOP_ITEMS.filter(i => selectedCat === 'ALL' || i.category === selectedCat);

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
        borderRadius: '28px', border: '1px solid rgba(236,72,153,0.4)',
        overflowY: 'auto'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ec4899' }}>🏪 CỬA HÀNG VÔ TRI</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Số dư: <strong style={{ color: '#fbbf24' }}>💰 {coins} Xu</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'frame', label: 'Khung Profile 🖼️' },
            { id: 'effect', label: 'Hiệu ứng Pháo Giấy ✨' },
            { id: 'title', label: 'Danh hiệu 👑' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold',
                background: selectedCat === cat.id ? '#ec4899' : 'rgba(255,255,255,0.08)',
                color: '#fff', border: 'none', cursor: 'pointer'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Shop Items Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1rem' }}>
          {filteredItems.map((item) => {
            const isOwned = shopOwned.includes(item.id);
            const canAfford = coins >= item.price;

            return (
              <div 
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.8rem',
                  background: 'rgba(255,255,255,0.04)', borderRadius: '20px',
                  border: isOwned ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.12)'
                }}
              >
                <div style={{ fontSize: '50px' }}>{item.icon}</div>
                <div style={{ textAlign: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 'bold' }}>{item.name}</h4>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>{item.desc}</p>
                </div>

                <div style={{ width: '100%', marginTop: 'auto' }}>
                  {isOwned ? (
                    <button className="btn-cute" style={{ width: '100%', background: '#334155', color: '#10b981', fontSize: '0.85rem' }} disabled>
                      ✓ Đã Sở Hữu
                    </button>
                  ) : (
                    <button 
                      className="btn-cute" 
                      style={{ width: '100%', background: canAfford ? 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)' : '#475569', fontSize: '0.85rem' }}
                      disabled={!canAfford}
                      onClick={() => {
                        if (window.confirm(`Xác nhận mua "${item.name}" với giá ${item.price} xu?`)) {
                          onBuyItem(item);
                        }
                      }}
                    >
                      Mua ({item.price} xu)
                    </button>
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
