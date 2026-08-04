import React, { useState } from 'react';
import './index.css';

// Item database
const ITEMS = [
  { id: 1, name: "Túi rác đen", rarity: "Common", rarityClass: "rarity-common", img: "/assets/garbage_bag_1785865795905.jpg" },
  { id: 2, name: "Lõi giấy vệ sinh", rarity: "Common", rarityClass: "rarity-common", img: "/assets/toilet_paper_core_1785865805394.jpg" },
  { id: 3, name: "Túi nilon đi chợ", rarity: "Rare", rarityClass: "rarity-rare", img: "/assets/shopping_bag_1785865829267.jpg" },
  { id: 4, name: "Hóa đơn nợ", rarity: "Epic", rarityClass: "rarity-epic", img: "/assets/receipt_debt_1785865838346.jpg" },
  // Adding some emojis as fallback for Legendary
  { id: 5, name: "Tờ 500k", rarity: "Legendary", rarityClass: "rarity-legendary", icon: "💵" },
  { id: 6, name: "Cục đá cuội", rarity: "Common", rarityClass: "rarity-common", icon: "🪨" },
];

function App() {
  const [coins, setCoins] = useState(100);
  const [isOpening, setIsOpening] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultItem, setResultItem] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [showInventory, setShowInventory] = useState(false);

  const costPerOpen = 10;

  const handleOpenBag = () => {
    if (isOpening) return;
    if (coins < costPerOpen) {
      alert("Bạn không đủ xu để xé túi!");
      return;
    }

    setIsOpening(true);
    setCoins(prev => prev - costPerOpen);

    // After animation, show result
    setTimeout(() => {
      const randomIdx = Math.floor(Math.random() * ITEMS.length);
      const item = ITEMS[randomIdx];
      setResultItem(item);
      setInventory(prev => [...prev, item]);
      setIsOpening(false);
      setShowResult(true);
    }, 800); // 800ms match CSS animation roughly
  };

  const handleCloseResult = () => {
    setShowResult(false);
    setResultItem(null);
  };

  return (
    <div className="app-container" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100vh', justifyContent: 'space-between' }}>
      
      {/* Header */}
      <header className="glass-panel" style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', width: '100%', maxWidth: '800px', alignItems: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, background: 'linear-gradient(to right, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Xé Túi Mù
        </h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>💰 {coins} Xu</div>
          <button className="btn" style={{ padding: '8px 16px', fontSize: '0.9rem' }} onClick={() => setShowInventory(!showInventory)}>
            🎒 Túi Đồ ({inventory.length})
          </button>
        </div>
      </header>

      {/* Main Play Area */}
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', flex: 1, justifyContent: 'center' }}>
        
        {/* The Blind Bag */}
        <div 
          className={`glass-panel flex-center ${isOpening ? 'animate-shake' : ''}`}
          style={{ 
            width: '240px', height: '300px', cursor: isOpening ? 'default' : 'pointer',
            background: 'linear-gradient(180deg, rgba(99,102,241,0.5) 0%, rgba(236,72,153,0.5) 100%)',
            border: '2px solid rgba(255,255,255,0.4)',
            boxShadow: '0 0 40px rgba(236,72,153,0.3), inset 0 0 20px rgba(255,255,255,0.2)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: isOpening ? 'scale(0.95)' : 'scale(1)',
            opacity: showResult ? 0 : 1
          }}
          onClick={handleOpenBag}
        >
          <div style={{ fontSize: '80px', filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.8))' }}>❓</div>
        </div>

        <button 
          className="btn" 
          onClick={handleOpenBag} 
          disabled={isOpening || coins < costPerOpen || showResult}
          style={{ padding: '15px 40px', fontSize: '1.2rem' }}
        >
          Xé Túi ({costPerOpen} xu)
        </button>
      </main>

      {/* Result Popup */}
      {showResult && resultItem && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 100
        }}>
          <div className="glass-panel animate-pop-in" style={{
            padding: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)',
            maxWidth: '90%', width: '400px'
          }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff' }}>Bạn nhận được!</h2>
            
            <div style={{ 
              width: '150px', height: '150px', borderRadius: '20px', 
              background: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center',
              overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>
              {resultItem.img ? (
                <img src={resultItem.img} alt={resultItem.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontSize: '80px' }}>{resultItem.icon}</span>
              )}
            </div>

            <div style={{ textAlign: 'center' }}>
              <h3 className={resultItem.rarityClass} style={{ fontSize: '1.8rem', fontWeight: 800, margin: '10px 0' }}>
                {resultItem.name}
              </h3>
              <p className={resultItem.rarityClass} style={{ textTransform: 'uppercase', letterSpacing: '3px', fontSize: '1rem' }}>
                {resultItem.rarity}
              </p>
            </div>

            <button className="btn" onClick={handleCloseResult} style={{ marginTop: '1rem', width: '100%' }}>
              Tiếp Tục
            </button>
          </div>
        </div>
      )}

      {/* Inventory Sidebar (simplified as modal for now) */}
      {showInventory && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)',
          display: 'flex', justifyContent: 'flex-end',
          zIndex: 50
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '400px', height: '100vh', borderRadius: '24px 0 0 24px',
            padding: '2rem', display: 'flex', flexDirection: 'column',
            animation: 'popIn 0.3s forwards', transformOrigin: 'right center'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Túi Đồ ({inventory.length})</h2>
              <button onClick={() => setShowInventory(false)} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>✕</button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {inventory.map((item, idx) => (
                <div key={idx} className="glass-panel" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)' }}>
                  <div style={{ width: '60px', height: '60px', borderRadius: '10px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'rgba(255,255,255,0.1)' }}>
                     {item.img ? (
                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '30px' }}>{item.icon}</span>
                      )}
                  </div>
                  <span style={{ fontSize: '0.9rem', textAlign: 'center', fontWeight: 'bold' }} className={item.rarityClass}>{item.name}</span>
                </div>
              ))}
              {inventory.length === 0 && (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: '#94a3b8', marginTop: '2rem' }}>
                  Chưa có vật phẩm nào.<br/>Hãy xé túi để thu thập!
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
