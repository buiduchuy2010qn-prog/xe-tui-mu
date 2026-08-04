import React, { useState, useEffect, useCallback } from 'react';
import './index.css';

// Components & Modules
import { Header } from './components/Header';
import { BagSelector } from './components/BagSelector';
import { ResultModal } from './components/ResultModal';
import { InventoryModal } from './components/InventoryModal';
import { QuestsModal } from './components/QuestsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { ParticlesCanvas } from './components/ParticlesCanvas';

import { BAGS } from './data/bags';
import { ITEM_RARITIES } from './data/items';
import { soundManager } from './utils/sound';
import { 
  loadState, 
  saveState, 
  resetState, 
  exportSaveJson, 
  importSaveJson 
} from './utils/storage';

export default function App() {
  // Game State
  const [gameState, setGameState] = useState(() => loadState());
  
  // UI States
  const [isOpening, setIsOpening] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [activeModal, setActiveModal] = useState(null); // 'inventory' | 'quests' | 'achievements' | 'settings' | null
  const [particleTrigger, setParticleTrigger] = useState(0);

  // Sync sound manager with settings
  useEffect(() => {
    soundManager.setEnabled(gameState.settings.sound);
  }, [gameState.settings.sound]);

  // Persist state on change
  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  // Check achievements helper
  const checkAchievements = useCallback((newState) => {
    let updatedState = { ...newState };
    let achievementsMap = { ...updatedState.achievements };
    let updatedCoins = updatedState.coins;
    let hasNewUnlocked = false;

    const totalOpened = updatedState.stats.totalOpened;
    const unlockedItemsCount = Object.values(updatedState.items).filter(i => i.unlocked).length;
    const totalItemsCount = Object.keys(updatedState.items).length;

    const unlock = (id) => {
      if (achievementsMap[id] && !achievementsMap[id].unlocked) {
        achievementsMap[id] = {
          ...achievementsMap[id],
          unlocked: true,
          unlockedAt: Date.now()
        };
        updatedCoins += achievementsMap[id].reward;
        hasNewUnlocked = true;
        soundManager.playLegendary();
      }
    };

    if (totalOpened >= 1) unlock('first_rip');
    if (totalOpened >= 10) unlock('rip_10');
    if (totalOpened >= 100) unlock('rip_100');
    if (unlockedItemsCount >= 10) unlock('collect_10');
    if (unlockedItemsCount === totalItemsCount) unlock('master_collector');
    if (updatedState.consecutiveCommon >= 10) unlock('unlucky_10');

    if (hasNewUnlocked) {
      return {
        ...updatedState,
        coins: updatedCoins,
        achievements: achievementsMap
      };
    }

    return updatedState;
  }, []);

  // Handle Bag Selection
  const handleSelectBag = (bagId) => {
    if (isOpening) return;
    setGameState(prev => ({ ...prev, selectedBagId: bagId }));
  };

  // Handle Bag Rip Execution
  const handleRipBag = (bag) => {
    if (isOpening) return;

    if (gameState.coins < bag.cost) {
      alert(`Bạn không đủ ${bag.cost} xu để xé ${bag.name}!`);
      return;
    }

    setIsOpening(true);
    
    // Deduct coins & update stats
    setGameState(prev => ({
      ...prev,
      coins: prev.coins - bag.cost,
      stats: {
        ...prev.stats,
        totalOpened: prev.stats.totalOpened + 1,
        totalSpent: prev.stats.totalSpent + bag.cost
      }
    }));

    // Play ripping sound
    soundManager.playRip();

    // After animation delay, calculate result item
    setTimeout(() => {
      // Apply Pity Booster if consecutive non-rare >= 5
      let rates = { ...bag.rates };
      if (gameState.pityCounter >= 5) {
        rates.Rare += 0.15;
        rates.Epic += 0.10;
        rates.Legendary += 0.05;
        rates.Common = Math.max(0, rates.Common - 0.30);
      }

      // Roll Rarity
      const roll = Math.random();
      let chosenRarity = 'Common';
      let cumulative = 0;

      if (roll < (cumulative += rates.Legendary)) chosenRarity = 'Legendary';
      else if (roll < (cumulative += rates.Epic)) chosenRarity = 'Epic';
      else if (roll < (cumulative += rates.Rare)) chosenRarity = 'Rare';
      else chosenRarity = 'Common';

      // Pick random item of chosen rarity from global pool
      const itemsOfRarity = Object.values(gameState.items).filter(i => i.rarity.toUpperCase() === chosenRarity.toUpperCase());
      const selectedItem = itemsOfRarity.length > 0 
        ? itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)]
        : Object.values(gameState.items)[0];

      const isFirstTime = !selectedItem.unlocked;

      // Update state with rolled item
      setGameState(prev => {
        const itemInState = prev.items[selectedItem.id];
        const updatedItem = {
          ...itemInState,
          unlocked: true,
          count: itemInState.count + 1,
          firstObtainedAt: itemInState.firstObtainedAt || Date.now()
        };

        const updatedItemsMap = {
          ...prev.items,
          [selectedItem.id]: updatedItem
        };

        const isRarePlus = ['Rare', 'Epic', 'Legendary'].includes(chosenRarity);

        // Update Quests
        const updatedQuests = { ...prev.quests };
        updatedQuests.rip3 = { ...updatedQuests.rip3, progress: updatedQuests.rip3.progress + 1 };
        if (isFirstTime) {
          updatedQuests.new3 = { ...updatedQuests.new3, progress: updatedQuests.new3.progress + 1 };
        }
        if (isRarePlus) {
          updatedQuests.rare1 = { ...updatedQuests.rare1, progress: updatedQuests.rare1.progress + 1 };
        }

        let nextState = {
          ...prev,
          items: updatedItemsMap,
          quests: updatedQuests,
          pityCounter: isRarePlus ? 0 : prev.pityCounter + 1,
          consecutiveCommon: chosenRarity === 'Common' ? prev.consecutiveCommon + 1 : 0
        };

        // Specific achievement triggers
        if (chosenRarity === 'Rare' || chosenRarity === 'Epic') {
          if (nextState.achievements.first_rare && !nextState.achievements.first_rare.unlocked) {
            nextState.achievements.first_rare.unlocked = true;
            nextState.coins += nextState.achievements.first_rare.reward;
          }
        }
        if (chosenRarity === 'Legendary') {
          if (nextState.achievements.first_legendary && !nextState.achievements.first_legendary.unlocked) {
            nextState.achievements.first_legendary.unlocked = true;
            nextState.coins += nextState.achievements.first_legendary.reward;
          }
        }

        return checkAchievements(nextState);
      });

      // Prepare Result Data
      setResultData({
        item: selectedItem,
        isNew: isFirstTime,
        totalCount: gameState.items[selectedItem.id].count + 1
      });

      setIsOpening(false);
      setParticleTrigger(Date.now());

      // Play corresponding sound
      if (chosenRarity === 'Legendary') soundManager.playLegendary();
      else if (chosenRarity === 'Epic' || chosenRarity === 'Rare') soundManager.playRare();
      else soundManager.playPop();

    }, 750);
  };

  // Quest Claiming
  const handleClaimQuest = (questId) => {
    setGameState(prev => {
      const q = prev.quests[questId];
      if (!q || q.claimed || q.progress < q.target) return prev;
      
      soundManager.playCoin();

      return {
        ...prev,
        coins: prev.coins + q.reward,
        quests: {
          ...prev.quests,
          [questId]: { ...q, claimed: true }
        }
      };
    });
  };

  // Free Coins Claiming
  const handleClaimFreeCoins = () => {
    soundManager.playCoin();
    setGameState(prev => ({
      ...prev,
      coins: prev.coins + 100,
      lastFreeClaimTime: Date.now()
    }));
  };

  // Toggle Item Favorite
  const handleToggleFavorite = (itemId) => {
    setGameState(prev => ({
      ...prev,
      items: {
        ...prev.items,
        [itemId]: {
          ...prev.items[itemId],
          isFavorite: !prev.items[itemId].isFavorite
        }
      }
    }));
  };

  // Reset Progress
  const handleResetData = () => {
    const newState = resetState();
    setGameState(newState);
    setActiveModal(null);
    setResultData(null);
  };

  // Export & Import Save
  const handleExportSave = () => {
    exportSaveJson(gameState);
  };

  const handleImportSave = (jsonText) => {
    const imported = importSaveJson(jsonText);
    if (imported) {
      setGameState(imported);
      alert('Nhập dữ liệu thành công!');
      setActiveModal(null);
    }
  };

  const unlockedCount = Object.values(gameState.items).filter(i => i.unlocked).length;
  const totalItemsCount = Object.keys(gameState.items).length;
  const selectedBag = BAGS.find(b => b.id === gameState.selectedBagId) || BAGS[0];

  return (
    <div className="app-container" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'space-between', gap: '1.5rem' }}>
      
      {/* Canvas Particle Effect */}
      {resultData && (
        <ParticlesCanvas 
          trigger={particleTrigger} 
          rarity={resultData.item.rarity} 
          enabled={gameState.settings.particles} 
        />
      )}

      {/* Header */}
      <Header 
        coins={gameState.coins}
        inventoryCount={unlockedCount}
        totalItemsCount={totalItemsCount}
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenQuests={() => setActiveModal('quests')}
        onOpenAchievements={() => setActiveModal('achievements')}
        onOpenSettings={() => setActiveModal('settings')}
        soundEnabled={gameState.settings.sound}
        onToggleSound={() => setGameState(prev => ({ ...prev, settings: { ...prev.settings, sound: !prev.settings.sound } }))}
      />

      {/* Main Bag Selection & Unboxing Area */}
      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BagSelector 
          selectedBagId={gameState.selectedBagId}
          onSelectBag={handleSelectBag}
          onRipBag={handleRipBag}
          isOpening={isOpening}
          coins={gameState.coins}
        />
      </main>

      {/* Modals */}
      {resultData && (
        <ResultModal 
          resultData={resultData}
          onClose={() => setResultData(null)}
          onRipAgain={() => {
            setResultData(null);
            handleRipBag(selectedBag);
          }}
          onOpenInventory={() => {
            setResultData(null);
            setActiveModal('inventory');
          }}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal 
          itemsMap={gameState.items}
          onClose={() => setActiveModal(null)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {activeModal === 'quests' && (
        <QuestsModal 
          questsMap={gameState.quests}
          onClaimQuest={handleClaimQuest}
          lastFreeClaimTime={gameState.lastFreeClaimTime}
          onClaimFreeCoins={handleClaimFreeCoins}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'achievements' && (
        <AchievementsModal 
          achievementsMap={gameState.achievements}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal 
          settings={gameState.settings}
          onToggleSound={() => setGameState(prev => ({ ...prev, settings: { ...prev.settings, sound: !prev.settings.sound } }))}
          onToggleParticles={() => setGameState(prev => ({ ...prev, settings: { ...prev.settings, particles: !prev.settings.particles } }))}
          onResetData={handleResetData}
          onExportSave={handleExportSave}
          onImportSave={handleImportSave}
          onClose={() => setActiveModal(null)}
        />
      )}

      {/* Footer */}
      <footer style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
        Xé Túi Mù Vô Tri Game • Phiên bản 2.0 Complete • Auto-saved in browser
      </footer>
    </div>
  );
}
