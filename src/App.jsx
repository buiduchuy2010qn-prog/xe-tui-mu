import React, { useState, useEffect, useCallback, useRef } from 'react';
import './index.css';

// Components & Modules
import { Header } from './components/Header';
import { BagSelector } from './components/BagSelector';
import { ResultModal } from './components/ResultModal';
import { MultiResultModal } from './components/MultiResultModal';
import { InventoryModal } from './components/InventoryModal';
import { QuestsModal } from './components/QuestsModal';
import { AchievementsModal } from './components/AchievementsModal';
import { SettingsModal } from './components/SettingsModal';
import { ProfileModal } from './components/ProfileModal';
import { ShopModal } from './components/ShopModal';
import { RecycleModal } from './components/RecycleModal';
import { CollectionsModal } from './components/CollectionsModal';
import { HistoryModal } from './components/HistoryModal';
import { AdminSimModal } from './components/AdminSimModal';
import { TutorialOverlay } from './components/TutorialOverlay';
import { ParticlesCanvas } from './components/ParticlesCanvas';

import { BAGS } from './data/bags';
import { ITEM_RARITIES } from './data/items';
import { COLLECTIONS } from './data/collections';
import { soundManager } from './utils/sound';
import { addExp } from './utils/level';
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
  
  // Animation & UI States
  const [isOpening, setIsOpening] = useState(false);
  const [singleResultData, setSingleResultData] = useState(null);
  const [multiResultsData, setMultiResultsData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!gameState.tutorialCompleted);

  const ripTimeoutRef = useRef(null);

  // Sync sound manager with settings
  useEffect(() => {
    soundManager.setEnabled(gameState.settings.sound);
  }, [gameState.settings.sound]);

  // Persist state on change
  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  // Keyboard shortcut: Escape to close modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (singleResultData) setSingleResultData(null);
        else if (multiResultsData) setMultiResultsData(null);
        else if (activeModal) setActiveModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [singleResultData, multiResultsData, activeModal]);

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

  // Perform Rip Processing (Single or Multi-count)
  const executeRip = (bag, count = 1) => {
    const totalCost = bag.cost * count;
    if (gameState.coins < totalCost) {
      alert(`Bạn không đủ ${totalCost} xu để xé ${count}x ${bag.name}!`);
      return;
    }

    setIsOpening(true);

    // Deduct coins & add EXP
    const expGained = bag.expGain * count;
    const levelResult = addExp(gameState.level, gameState.exp, expGained);

    if (levelResult.leveledUp) {
      soundManager.playLegendary();
      alert(`🎉 CHÚC MỪNG! Bạn đã thăng cấp Lv.${levelResult.level}! Nhận +${levelResult.totalRewardCoins} Xu thưởng!`);
    }

    setGameState(prev => ({
      ...prev,
      coins: prev.coins - totalCost + levelResult.totalRewardCoins,
      level: levelResult.level,
      exp: levelResult.exp,
      stats: {
        ...prev.stats,
        totalOpened: prev.stats.totalOpened + count,
        totalSpent: prev.stats.totalSpent + totalCost
      }
    }));

    soundManager.playRip();

    // Process rolls
    ripTimeoutRef.current = setTimeout(() => {
      processRollResults(bag, count);
    }, 750);
  };

  const processRollResults = (bag, count) => {
    let currentGameState = loadState();
    let currentPity = { ...currentGameState.pityMap[bag.id] || { rare: 0, epic: 0 } };
    let currentItemsMap = { ...currentGameState.items };
    let currentHistory = [...currentGameState.historyLog];
    let currentQuests = { ...currentGameState.quests };
    let currentConsecutiveCommon = currentGameState.consecutiveCommon;

    const results = [];

    for (let c = 0; c < count; c++) {
      let rates = { ...bag.rates };

      // Apply pity booster
      if (currentPity.rare >= bag.pityRareMax) rates.Rare += 0.20;
      if (currentPity.epic >= bag.pityEpicMax) rates.Epic += 0.15;

      const roll = Math.random();
      let chosenRarity = 'Common';
      let cumulative = 0;

      if (roll < (cumulative += rates.Legendary)) chosenRarity = 'Legendary';
      else if (roll < (cumulative += rates.Epic)) chosenRarity = 'Epic';
      else if (roll < (cumulative += rates.Rare)) chosenRarity = 'Rare';
      else chosenRarity = 'Common';

      // Pick item of chosen rarity
      const itemsOfRarity = Object.values(currentItemsMap).filter(i => i.rarity.toUpperCase() === chosenRarity.toUpperCase());
      const selectedItem = itemsOfRarity.length > 0
        ? itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)]
        : Object.values(currentItemsMap)[0];

      const isFirstTime = !currentItemsMap[selectedItem.id].unlocked;
      const newCount = currentItemsMap[selectedItem.id].count + 1;

      // Update item in state
      currentItemsMap[selectedItem.id] = {
        ...currentItemsMap[selectedItem.id],
        unlocked: true,
        count: newCount,
        firstObtainedAt: currentItemsMap[selectedItem.id].firstObtainedAt || Date.now()
      };

      const isRarePlus = ['Rare', 'Epic', 'Legendary'].includes(chosenRarity);

      // Update pity
      if (isRarePlus) currentPity.rare = 0;
      else currentPity.rare += 1;

      if (['Epic', 'Legendary'].includes(chosenRarity)) currentPity.epic = 0;
      else currentPity.epic += 1;

      currentConsecutiveCommon = chosenRarity === 'Common' ? currentConsecutiveCommon + 1 : 0;

      // Update Quests progress
      currentQuests.daily_rip3.progress += 1;
      currentQuests.weekly_rip30.progress += 1;
      if (isFirstTime) {
        currentQuests.daily_new1.progress += 1;
      }
      if (isRarePlus) {
        currentQuests.daily_rare1.progress += 1;
      }

      // Add to history
      currentHistory.unshift({
        id: Date.now() + c,
        timestamp: Date.now(),
        bagName: bag.name,
        cost: bag.cost,
        item: selectedItem,
        rarity: chosenRarity,
        isNew: isFirstTime
      });

      results.push({
        item: selectedItem,
        isNew: isFirstTime,
        totalCount: newCount
      });
    }

    // Trim history log to max 50
    currentHistory = currentHistory.slice(0, 50);

    // Save final updated state
    setGameState(prev => {
      let updatedState = {
        ...prev,
        items: currentItemsMap,
        quests: currentQuests,
        historyLog: currentHistory,
        pityMap: {
          ...prev.pityMap,
          [bag.id]: currentPity
        },
        consecutiveCommon: currentConsecutiveCommon
      };

      return checkAchievements(updatedState);
    });

    setIsOpening(false);
    setParticleTrigger(Date.now());

    if (count === 1) {
      setSingleResultData(results[0]);
      if (results[0].item.rarity === 'Legendary') soundManager.playLegendary();
      else if (['Epic', 'Rare'].includes(results[0].item.rarity)) soundManager.playRare();
      else soundManager.playPop();
    } else {
      setMultiResultsData(results);
      soundManager.playRare();
    }
  };

  // Skip Animation Handler
  const handleSkipAnimation = () => {
    if (ripTimeoutRef.current) {
      clearTimeout(ripTimeoutRef.current);
    }
    const bag = BAGS.find(b => b.id === gameState.selectedBagId) || BAGS[0];
    processRollResults(bag, 1);
  };

  // Deconstruct Items Handler
  const handleDeconstructItem = (itemId) => {
    setGameState(prev => {
      const item = prev.items[itemId];
      if (!item || item.count <= 1) return prev;

      soundManager.playCoin();

      return {
        ...prev,
        shards: prev.shards + 10,
        items: {
          ...prev.items,
          [itemId]: { ...item, count: item.count - 1 }
        }
      };
    });
  };

  const handleDeconstructAll = () => {
    setGameState(prev => {
      let extraCount = 0;
      const updatedItems = { ...prev.items };

      Object.keys(updatedItems).forEach(id => {
        if (updatedItems[id].count > 1) {
          extraCount += (updatedItems[id].count - 1);
          updatedItems[id] = { ...updatedItems[id], count: 1 };
        }
      });

      if (extraCount === 0) return prev;

      soundManager.playCoin();

      return {
        ...prev,
        shards: prev.shards + extraCount * 10,
        items: updatedItems
      };
    });
  };

  const handleExchangeShards = (bagId, shardCost) => {
    if (gameState.shards < shardCost) {
      alert('Bạn không đủ Mảnh Vô Tri!');
      return;
    }
    const bag = BAGS.find(b => b.id === bagId) || BAGS[0];
    setGameState(prev => ({ ...prev, shards: prev.shards - shardCost }));
    executeRip(bag, 1);
  };

  // Shop Buy Handler
  const handleBuyShopItem = (shopItem) => {
    if (gameState.coins < shopItem.price) {
      alert('Bạn không đủ xu!');
      return;
    }

    soundManager.playCoin();

    setGameState(prev => ({
      ...prev,
      coins: prev.coins - shopItem.price,
      shopOwned: [...prev.shopOwned, shopItem.id]
    }));
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
        [itemId]: { ...prev.items[itemId], isFavorite: !prev.items[itemId].isFavorite }
      }
    }));
  };

  const selectedBag = BAGS.find(b => b.id === gameState.selectedBagId) || BAGS[0];
  const unlockedCount = Object.values(gameState.items).filter(i => i.unlocked).length;
  const totalItemsCount = Object.keys(gameState.items).length;

  return (
    <div className="app-container" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'space-between', gap: '1.5rem' }}>
      
      {/* Onboarding Tutorial */}
      {showTutorial && (
        <TutorialOverlay 
          onComplete={() => {
            setShowTutorial(false);
            setGameState(prev => ({ ...prev, tutorialCompleted: true }));
          }} 
        />
      )}

      {/* Canvas Particle Effect */}
      {singleResultData && (
        <ParticlesCanvas 
          trigger={particleTrigger} 
          rarity={singleResultData.item.rarity} 
          enabled={gameState.settings.particles} 
        />
      )}

      {/* Header */}
      <Header 
        coins={gameState.coins}
        shards={gameState.shards}
        level={gameState.level}
        exp={gameState.exp}
        profile={gameState.profile}
        inventoryCount={unlockedCount}
        totalItemsCount={totalItemsCount}
        onOpenProfile={() => setActiveModal('profile')}
        onOpenShop={() => setActiveModal('shop')}
        onOpenCollections={() => setActiveModal('collections')}
        onOpenInventory={() => setActiveModal('inventory')}
        onOpenRecycle={() => setActiveModal('recycle')}
        onOpenQuests={() => setActiveModal('quests')}
        onOpenAchievements={() => setActiveModal('achievements')}
        onOpenHistory={() => setActiveModal('history')}
        onOpenSettings={() => setActiveModal('settings')}
        soundEnabled={gameState.settings.sound}
        onToggleSound={() => setGameState(prev => ({ ...prev, settings: { ...prev.settings, sound: !prev.settings.sound } }))}
      />

      {/* Main Bag Selector & Rip UI */}
      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BagSelector 
          selectedBagId={gameState.selectedBagId}
          onSelectBag={handleSelectBag}
          onRipBag={executeRip}
          onSkipAnimation={handleSkipAnimation}
          isOpening={isOpening}
          coins={gameState.coins}
          playerLevel={gameState.level}
          pityMap={gameState.pityMap}
        />
      </main>

      {/* Modals */}
      {singleResultData && (
        <ResultModal 
          resultData={singleResultData}
          onClose={() => setSingleResultData(null)}
          onRipAgain={() => {
            setSingleResultData(null);
            executeRip(selectedBag, 1);
          }}
          onOpenInventory={() => {
            setSingleResultData(null);
            setActiveModal('inventory');
          }}
        />
      )}

      {multiResultsData && (
        <MultiResultModal 
          multiResults={multiResultsData}
          bag={selectedBag}
          onClose={() => setMultiResultsData(null)}
          onRipAgain={() => {
            setMultiResultsData(null);
            executeRip(selectedBag, multiResultsData.length);
          }}
        />
      )}

      {activeModal === 'profile' && (
        <ProfileModal 
          profile={gameState.profile}
          level={gameState.level}
          exp={gameState.exp}
          coins={gameState.coins}
          shards={gameState.shards}
          stats={gameState.stats}
          unlockedCount={unlockedCount}
          totalCount={totalItemsCount}
          shopOwned={gameState.shopOwned}
          itemsMap={gameState.items}
          onUpdateProfile={(p) => setGameState(prev => ({ ...prev, profile: p }))}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'shop' && (
        <ShopModal 
          coins={gameState.coins}
          shopOwned={gameState.shopOwned}
          onBuyItem={handleBuyShopItem}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'collections' && (
        <CollectionsModal 
          itemsMap={gameState.items}
          achievementsMap={gameState.achievements}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'inventory' && (
        <InventoryModal 
          itemsMap={gameState.items}
          onClose={() => setActiveModal(null)}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {activeModal === 'recycle' && (
        <RecycleModal 
          itemsMap={gameState.items}
          shards={gameState.shards}
          onDeconstructItem={handleDeconstructItem}
          onDeconstructAll={handleDeconstructAll}
          onExchangeShards={handleExchangeShards}
          onClose={() => setActiveModal(null)}
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

      {activeModal === 'history' && (
        <HistoryModal 
          historyLog={gameState.historyLog}
          onClearHistory={() => setGameState(prev => ({ ...prev, historyLog: [] }))}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal 
          settings={gameState.settings}
          performanceMode={gameState.performanceMode}
          onToggleSound={() => setGameState(prev => ({ ...prev, settings: { ...prev.settings, sound: !prev.settings.sound } }))}
          onToggleParticles={() => setGameState(prev => ({ ...prev, settings: { ...prev.settings, particles: !prev.settings.particles } }))}
          onChangePerformanceMode={(mode) => setGameState(prev => ({ ...prev, performanceMode: mode }))}
          onResetData={() => {
            const newState = resetState();
            setGameState(newState);
            setActiveModal(null);
            setSingleResultData(null);
            setMultiResultsData(null);
          }}
          onExportSave={() => exportSaveJson(gameState)}
          onImportSave={(jsonText) => {
            const imported = importSaveJson(jsonText);
            if (imported) {
              setGameState(imported);
              alert('Nhập dữ liệu thành công!');
              setActiveModal(null);
            }
          }}
          onOpenTutorial={() => {
            setActiveModal(null);
            setShowTutorial(true);
          }}
          onOpenAdminSim={() => setActiveModal('adminSim')}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'adminSim' && (
        <AdminSimModal onClose={() => setActiveModal(null)} />
      )}

      {/* Footer */}
      <footer style={{ fontSize: '0.8rem', color: '#64748b', textAlign: 'center' }}>
        Xé Túi Mù Vô Tri Web Game v2.5 • Full Systems Active • Auto-saved
      </footer>
    </div>
  );
}
