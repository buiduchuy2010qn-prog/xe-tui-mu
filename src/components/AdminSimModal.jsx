import React, { useState } from 'react';
import { BAGS } from '../data/bags';
import { INITIAL_ITEMS } from '../data/items';

export const AdminSimModal = ({ onClose }) => {
  const [selectedBagId, setSelectedBagId] = useState('trash_bag');
  const [simCount, setSimCount] = useState(1000);
  const [simResult, setSimResult] = useState(null);

  const runSimulation = () => {
    const bag = BAGS.find(b => b.id === selectedBagId) || BAGS[0];
    const counts = { Common: 0, Rare: 0, Epic: 0, Legendary: 0 };
    let pityRare = 0;
    let pityEpic = 0;

    for (let i = 0; i < simCount; i++) {
      let rates = { ...bag.rates };

      // Apply pity if limit reached
      if (pityRare >= bag.pityRareMax) {
        rates.Rare += 0.20;
      }
      if (pityEpic >= bag.pityEpicMax) {
        rates.Epic += 0.15;
      }

      const roll = Math.random();
      let chosenRarity = 'Common';
      let cumulative = 0;

      if (roll < (cumulative += rates.Legendary)) chosenRarity = 'Legendary';
      else if (roll < (cumulative += rates.Epic)) chosenRarity = 'Epic';
      else if (roll < (cumulative += rates.Rare)) chosenRarity = 'Rare';
      else chosenRarity = 'Common';

      counts[chosenRarity]++;

      if (['Rare', 'Epic', 'Legendary'].includes(chosenRarity)) pityRare = 0;
      else pityRare++;

      if (['Epic', 'Legendary'].includes(chosenRarity)) pityEpic = 0;
      else pityEpic++;
    }

    setSimResult({
      bagName: bag.name,
      total: simCount,
      counts,
      percentages: {
        Common: ((counts.Common / simCount) * 100).toFixed(2),
        Rare: ((counts.Rare / simCount) * 100).toFixed(2),
        Epic: ((counts.Epic / simCount) * 100).toFixed(2),
        Legendary: ((counts.Legendary / simCount) * 100).toFixed(2)
      }
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1100, padding: '1rem'
    }}>
      <div className="glass-panel animate-pop-in" style={{
        width: '100%', maxWidth: '600px', padding: '1.8rem',
        display: 'flex', flexDirection: 'column', gap: '1.2rem',
        background: 'linear-gradient(135deg, rgba(24,24,36,0.98) 0%, rgba(15,23,42,0.98) 100%)',
        borderRadius: '28px', border: '1px solid #10b981'
      }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>🛠️ MÔ PHỎNG TỶ LỆ RỚT ĐỒ (DEV ONLY)</h2>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Công cụ kiểm tra & chạy thử 1.000 - 10.000 lần mở túi</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer', width: '36px', height: '36px', borderRadius: '50%' }}>✕</button>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
          <select 
            value={selectedBagId} 
            onChange={(e) => setSelectedBagId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '12px', background: '#1e1b4b', color: '#fff', fontSize: '0.85rem' }}
          >
            {BAGS.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>

          <select 
            value={simCount} 
            onChange={(e) => setSimCount(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '12px', background: '#1e1b4b', color: '#fff', fontSize: '0.85rem' }}
          >
            <option value={1000}>1.000 lần mở</option>
            <option value="10000">10.000 lần mở</option>
          </select>

          <button className="btn-cute" style={{ background: '#10b981', fontSize: '0.85rem' }} onClick={runSimulation}>
            ▶ Chạy Mô Phỏng
          </button>
        </div>

        {/* Results */}
        {simResult && (
          <div className="glass-panel" style={{ padding: '1.2rem', background: 'rgba(255,255,255,0.04)', borderRadius: '16px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 'bold', color: '#34d399', marginBottom: '8px' }}>
              Kết quả mô phỏng cho {simResult.bagName} ({simResult.total} lần):
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem', fontSize: '0.9rem' }}>
              <div>• Thường (Common): <strong>{simResult.counts.Common}</strong> ({simResult.percentages.Common}%)</div>
              <div>• Hiếm (Rare): <strong style={{ color: '#38bdf8' }}>{simResult.counts.Rare}</strong> ({simResult.percentages.Rare}%)</div>
              <div>• Sử Thi (Epic): <strong style={{ color: '#c084fc' }}>{simResult.counts.Epic}</strong> ({simResult.percentages.Epic}%)</div>
              <div>• Huyền Thoại: <strong style={{ color: '#fbbf24' }}>{simResult.counts.Legendary}</strong> ({simResult.percentages.Legendary}%)</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
