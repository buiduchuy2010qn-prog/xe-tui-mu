import React, { useState, useMemo } from 'react';
import { ITEM_RARITIES } from '../data/items';

export const InventoryModal = ({ itemsMap, onClose, onToggleFavorite }) => {
  const [filterRarity, setFilterRarity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('UNLOCKED'); // UNLOCKED, RARITY, COUNT, NAME
  const [selectedItemDetail, setSelectedItemDetail] = useState(null);

  const itemList = useMemo(() => Object.values(itemsMap), [itemsMap]);

  // Statistics
  const totalItems = itemList.length;
  const unlockedItems = itemList.filter(i => i.unlocked);
  const unlockedCount = unlockedItems.length;
  const progressPercent = Math.round((unlockedCount / totalItems) * 100);

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    let list = [...itemList];

    // Filter by rarity
    if (filterRarity !== 'ALL') {
      list = list.filter(i => i.rarity.toUpperCase() === filterRarity);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      list = list.filter(i => i.name.toLowerCase().includes(q));
    }

    // Sort
    const rarityOrder = { LEGENDARY: 4, EPIC: 3, RARE: 2, COMMON: 1 };
    list.sort((a, b) => {
      // Favorite first
      if (a.isFavorite !== b.isFavorite) return b.isFavorite ? 1 : -1;

      if (sortBy === 'UNLOCKED') {
        if (a.unlocked !== b.unlocked) return b.unlocked ? 1 : -1;
        return (b.firstObtainedAt || 0) - (a.firstObtainedAt || 0);
      } else if (sortBy === 'RARITY') {
        const rA = rarityOrder[a.rarity.toUpperCase()] || 0;
        const rB = rarityOrder[b.rarity.toUpperCase()] || 0;
        if (rA !== rB) return rB - rA;
        return a.name.localeCompare(b.name);
      } else if (sortBy === 'COUNT') {
        return b.count - a.count;
      } else if (sortBy === 'NAME') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return list;
  }, [itemList, filterRarity, searchQuery, sortBy]);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 900, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '900px', maxHeight: '90vh',
        padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem',
        background: 'linear-gradient(135deg, rgba(30,27,75,0.95) 0%, rgba(17,17,25,0.95) 100%)',
        borderRadius: '28px', border: '1px solid rgba(255,255,255,0.2)'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>🎒 KHO ĐỒ VÔ TRI</h2>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Bộ sưu tập: <strong>{unlockedCount}/{totalItems}</strong> vật phẩm ({progressPercent}%)
            </p>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', 
              fontSize: '1.2rem', cursor: 'pointer', width: '38px', height: '38px', borderRadius: '50%' 
            }}
          >
            ✕
          </button>
        </div>

        {/* Progress Bar */}
        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden' }}>
          <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, #38bdf8, #fbbf24)', transition: 'width 0.4s ease' }} />
        </div>

        {/* Filter & Search Bar */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <input 
            type="text" 
            placeholder="🔍 Tìm vật phẩm..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              minWidth: '180px',
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          />

          {/* Rarity Filter */}
          <select 
            value={filterRarity} 
            onChange={(e) => setFilterRarity(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: '#1e1b4b',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          >
            <option value="ALL">Tất cả độ hiếm</option>
            <option value="COMMON">Thường</option>
            <option value="RARE">Hiếm</option>
            <option value="EPIC">Sử Thi</option>
            <option value="LEGENDARY">Huyền Thoại</option>
          </select>

          {/* Sort Option */}
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{
              padding: '8px 14px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: '#1e1b4b',
              color: '#fff',
              fontSize: '0.85rem'
            }}
          >
            <option value="UNLOCKED">Mới mở khóa</option>
            <option value="RARITY">Độ hiếm giảm dần</option>
            <option value="COUNT">Số lượng nhiều nhất</option>
            <option value="NAME">Tên A-Z</option>
          </select>
        </div>

        {/* Item Grid */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto', 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', 
          gap: '1rem', 
          paddingRight: '4px' 
        }}>
          {processedItems.map((item) => {
            const rarityInfo = ITEM_RARITIES[item.rarity.toUpperCase()] || ITEM_RARITIES.COMMON;

            return (
              <div 
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: item.unlocked ? rarityInfo.bg : 'rgba(255,255,255,0.02)',
                  border: item.unlocked ? `1px solid ${rarityInfo.border}` : '1px dashed rgba(255,255,255,0.1)',
                  borderRadius: '18px',
                  opacity: item.unlocked ? 1 : 0.45,
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'transform 0.2s ease'
                }}
                onClick={() => setSelectedItemDetail(item)}
              >
                {/* Favorite Button */}
                {item.unlocked && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(item.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      filter: item.isFavorite ? 'drop-shadow(0 0 4px #ef4444)' : 'grayscale(1)'
                    }}
                  >
                    ❤️
                  </button>
                )}

                {/* Thumbnail */}
                <div style={{
                  width: '65px',
                  height: '65px',
                  borderRadius: '14px',
                  overflow: 'hidden',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  background: 'rgba(0,0,0,0.3)',
                  border: item.unlocked ? `1px solid ${rarityInfo.border}80` : 'none'
                }}>
                  {item.unlocked ? (
                    item.img ? (
                      <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '36px' }}>{item.icon}</span>
                    )
                  ) : (
                    <span style={{ fontSize: '28px', color: '#64748b' }}>🔒</span>
                  )}
                </div>

                <span style={{ 
                  fontSize: '0.85rem', 
                  textAlign: 'center', 
                  fontWeight: 'bold', 
                  whiteSpace: 'nowrap', 
                  overflow: 'hidden', 
                  textOverflow: 'ellipsis', 
                  width: '100%',
                  color: item.unlocked ? rarityInfo.color : '#64748b'
                }}>
                  {item.unlocked ? item.name : '???'}
                </span>

                {item.unlocked && (
                  <span style={{ fontSize: '0.72rem', color: '#cbd5e1', background: 'rgba(0,0,0,0.4)', padding: '2px 8px', borderRadius: '10px' }}>
                    x{item.count}
                  </span>
                )}
              </div>
            );
          })}

          {processedItems.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', padding: '3rem 0' }}>
              Không tìm thấy vật phẩm nào phù hợp. 🔍
            </div>
          )}
        </div>

        {/* Item Detail Sub-Modal */}
        {selectedItemDetail && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 1000, padding: '1rem'
          }}>
            <div className="glass-panel animate-pop-in" style={{
              padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
              maxWidth: '380px', width: '100%', borderRadius: '24px', position: 'relative'
            }}>
              <button 
                onClick={() => setSelectedItemDetail(null)}
                style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}
              >
                ✕
              </button>

              <div style={{
                width: '110px', height: '110px', borderRadius: '20px', overflow: 'hidden',
                display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(0,0,0,0.4)'
              }}>
                {selectedItemDetail.unlocked ? (
                  selectedItemDetail.img ? (
                    <img src={selectedItemDetail.img} alt={selectedItemDetail.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span style={{ fontSize: '60px' }}>{selectedItemDetail.icon}</span>
                  )
                ) : (
                  <span style={{ fontSize: '50px' }}>❓</span>
                )}
              </div>

              <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold' }}>
                {selectedItemDetail.unlocked ? selectedItemDetail.name : 'Vật Phẩm Chưa Mở Khóa'}
              </h3>

              {selectedItemDetail.unlocked ? (
                <>
                  <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' }}>
                    "{selectedItemDetail.desc}"
                  </p>
                  <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    Đã sở hữu: <strong>x{selectedItemDetail.count}</strong> | Lần đầu: {selectedItemDetail.firstObtainedAt ? new Date(selectedItemDetail.firstObtainedAt).toLocaleDateString('vi-VN') : 'Không rõ'}
                  </div>
                </>
              ) : (
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', textAlign: 'center' }}>
                  Hãy tiếp tục xé các loại túi mù để thu thập vật phẩm này!
                </p>
              )}

              <button className="btn-cute" onClick={() => setSelectedItemDetail(null)} style={{ width: '100%', marginTop: '0.5rem' }}>
                Đóng
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
