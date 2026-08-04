import React, { useState } from 'react';
import './index.css';

// Sound effect generator using Web Audio API
const playRipSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 0.45;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufferSize, 0.5);
    }
    
    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
    filter.Q.setValueAtTime(2.5, audioCtx.currentTime);
    
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(1.0, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.45);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);
    
    noise.start();
  } catch (e) {
    console.error('Audio error', e);
  }
};

const playTadaSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + i * 0.08);
      osc.stop(audioCtx.currentTime + i * 0.08 + 0.35);
    });
  } catch (e) {
    console.error('Audio error', e);
  }
};

// Item Database
const ITEMS = [
  { id: 1, name: "Túi rác đen", rarity: "Common", rarityClass: "rarity-common", img: "/assets/garbage_bag_1785865795905.jpg" },
  { id: 2, name: "Lõi giấy vệ sinh", rarity: "Common", rarityClass: "rarity-common", img: "/assets/toilet_paper_core_1785865805394.jpg" },
  { id: 3, name: "Túi nilon đi chợ", rarity: "Rare", rarityClass: "rarity-rare", img: "/assets/shopping_bag_1785865829267.jpg" },
  { id: 4, name: "Hóa đơn nợ", rarity: "Epic", rarityClass: "rarity-epic", img: "/assets/receipt_debt_1785865838346.jpg" },
  { id: 5, name: "Chiếc tất rách", rarity: "Common", rarityClass: "rarity-common", icon: "🧦" },
  { id: 6, name: "Cục đá cuội", rarity: "Common", rarityClass: "rarity-common", icon: "🪨" },
  { id: 7, name: "Ốp lưng ố vàng", rarity: "Rare", rarityClass: "rarity-rare", icon: "📱" },
  { id: 8, name: "Tờ 500k VIP", rarity: "Legendary", rarityClass: "rarity-legendary", icon: "💵" },
];

// Cute Bag Types
const BAG_TYPES = [
  {
    id: 'cat',
    name: 'Túi Mèo Cute 🐱',
    cost: 10,
    color: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    border: '2px solid #ff758c',
    textColor: '#831843',
    badge: 'Phổ thông',
    pool: [1, 2, 5, 6]
  },
  {
    id: 'bear',
    name: 'Túi Gấu Mập 🐻',
    cost: 25,
    color: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
    border: '2px solid #f59e0b',
    textColor: '#78350f',
    badge: 'Khá Hiếm',
    pool: [2, 3, 5, 7]
  },
  {
    id: 'rabbit',
    name: 'Túi Thỏ Béo 🐰',
    cost: 50,
    color: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    border: '2px solid #3b82f6',
    textColor: '#1e3a8a',
    badge: 'Cực Hiếm',
    pool: [3, 4, 7, 8]
  },
  {
    id: 'vip',
    name: 'Túi Thần Kỳ 👑',
    cost: 100,
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: '2px solid #ec4899',
    textColor: '#831843',
    badge: 'VIP Siêu Cấp',
    pool: [4, 7, 8]
  }
];

function App() {
  const [coins, setCoins] = useState(200);
  const [activeOpeningBagId, setActiveOpeningBagId] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [resultItem, setResultItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);

  const handleOpenBag = (bag) => {
    if (activeOpeningBagId !== null) return;
    if (coins < bag.cost) {
      alert(`Bạn không đủ ${bag.cost} xu để xé ${bag.name}!`);
      return;
    }

    setActiveOpeningBagId(bag.id);
    setCoins(prev => prev - bag.cost);

    // Play tearing sound effect
    playRipSound();

    setTimeout(() => {
      // Pick random item from bag pool
      const poolItems = ITEMS.filter(item => bag.pool.includes(item.id));
      const randomItem = poolItems[Math.floor(Math.random() * poolItems.length)];

      setResultItem(randomItem);
      setInventory(prev => [randomItem, ...prev]);
      setActiveOpeningBagId(null);
      setShowResult(true);
      
      // Play Tada sound when result pops up
      playTadaSound();
    }, 700);
  };

  const handleClaimFreeCoins = () => {
    setCoins(prev => prev + 50);
    playTadaSound();
  };

  return (
    <div className="app-container" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'space-between' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '1000px', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '2rem' }}>🛍️</span>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, background: 'linear-gradient(to right, #ff758c, #ff7eb3)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Xé Túi Mù Vô Tri
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Chọn túi cute & xé tìm báu vật!</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '8px 16px', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold' }}>
            💰 {coins} Xu
          </div>
          <button className="btn-cute" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '8px 16px', fontSize: '0.9rem' }} onClick={handleClaimFreeCoins}>
            +50 Xu 🎁
          </button>
          <button className="btn-cute" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setShowInventory(true)}>
            🎒 Túi Đồ ({inventory.length})
          </button>
        </div>
      </header>

      {/* Main Grid: Multiple Cute Bags */}
      <main style={{ width: '100%', maxWidth: '1000px', margin: '2rem 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', color: '#e2e8f0', fontWeight: 600 }}>✨ Danh Sách Túi Mù Hot Nhất ✨</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', width: '100%' }}>
          {BAG_TYPES.map((bag) => {
            const isOpeningThis = activeOpeningBagId === bag.id;
            return (
              <div 
                key={bag.id}
                className={`glass-panel ${isOpeningThis ? 'animate-shake' : 'floating'}`}
                style={{ 
                  padding: '1.5rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  gap: '1rem',
                  background: bag.color,
                  border: bag.border,
                  borderRadius: '24px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  cursor: activeOpeningBagId !== null ? 'default' : 'pointer'
                }}
                onClick={() => handleOpenBag(bag)}
              >
                <span style={{ 
                  background: 'rgba(255,255,255,0.7)', 
                  color: bag.textColor, 
                  padding: '4px 12px', 
                  borderRadius: '20px', 
                  fontSize: '0.8rem', 
                  fontWeight: 'bold',
                  alignSelf: 'flex-start'
                }}>
                  {bag.badge}
                </span>

                {/* Cute Bag Illustration */}
                <div style={{
                  width: '130px',
                  height: '150px',
                  background: 'rgba(255,255,255,0.25)',
                  borderRadius: '24px 24px 16px 16px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: '65px',
                  boxShadow: 'inset 0 0 15px rgba(255,255,255,0.4), 0 8px 16px rgba(0,0,0,0.15)',
                  position: 'relative'
                }}>
                  <span style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                    {bag.id === 'cat' ? '🐱' : bag.id === 'bear' ? '🐻' : bag.id === 'rabbit' ? '🐰' : '👑'}
                  </span>
                </div>

                <div style={{ textAlign: 'center', color: bag.textColor }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{bag.name}</h3>
                </div>

                <button 
                  className="btn-cute" 
                  style={{ width: '100%', background: bag.textColor, color: '#fff', fontSize: '1rem' }}
                  disabled={activeOpeningBagId !== null || coins < bag.cost}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenBag(bag);
                  }}
                >
                  Xé Ngay ({bag.cost} xu)
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Result Modal */}
      {showResult && resultItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100, padding: '1rem'
        }}>
          <div className="glass-panel animate-pop-in" style={{
            padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.2rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            maxWidth: '420px', width: '100%', border: '2px solid rgba(255,255,255,0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
          }}>
            <h2 style={{ fontSize: '1.8rem', color: '#fff', textAlign: 'center' }}>🎉 Trúng Đồ Vô Tri! 🎉</h2>
            
            <div style={{ 
              width: '160px', height: '160px', borderRadius: '24px', 
              background: 'rgba(255,255,255,0.12)', display: 'flex', justifyContent: 'center', alignItems: 'center',
              overflow: 'hidden', boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
              border: '2px solid rgba(255,255,255,0.2)'
            }}>
              {resultItem.img ? (
                <img src={resultItem.img} alt={resultItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '85px' }}>{resultItem.icon}</span>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 className={resultItem.rarityClass} style={{ fontSize: '1.8rem', fontWeight: 800, margin: '8px 0' }}>
                {resultItem.name}
              </h3>
              <span className={resultItem.rarityClass} style={{ textTransform: 'uppercase', letterSpacing: '2px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                Độ hiếm: {resultItem.rarity}
              </span>
            </div>

            <button className="btn-cute" onClick={() => setShowResult(false)} style={{ marginTop: '0.8rem', width: '100%', fontSize: '1.1rem' }}>
              Thu Vào Túi Đồ 🎒
            </button>
          </div>
        </div>
      )}

      {/* Inventory Drawer */}
      {showInventory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)',
          display: 'flex', justifyContent: 'flex-end',
          zIndex: 90
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '420px', height: '100vh', borderRadius: '28px 0 0 28px',
            padding: '2rem', display: 'flex', flexDirection: 'column',
            animation: 'popIn 0.3s forwards', transformOrigin: 'right center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>🎒 Túi Đồ Đã Xé ({inventory.length})</h2>
              <button onClick={() => setShowInventory(false)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', paddingRight: '4px' }}>
              {inventory.map((item, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.06)' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '14px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.1)' }}>
                     {item.img ? (
                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '36px' }}>{item.icon}</span>
                      )}
                  </div>
                  <span style={{ fontSize: '0.95rem', textAlign: 'center', fontWeight: 'bold' }} className={item.rarityClass}>{item.name}</span>
                </div>
              ))}
              {inventory.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>
                  Chưa có vật phẩm nào.<br/>Hãy chọn một túi cute để xé nhé! 🛍️
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ marginTop: '2rem', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' }}>
        Túi mù vô tri Game • Built with React & AI Assets
      </footer>
    </div>
  );
}

export default App;
