import React, { useCallback, useEffect, useRef, useState } from 'react';
import './index.css';

import { Header } from './components/Header';
import { BagSelector } from './components/BagSelector';
import { UnboxingStage } from './components/UnboxingStage';
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
  const [gameState, setGameState] = useState(() => loadState());
  const [isOpening, setIsOpening] = useState(false);
  const [pendingRip, setPendingRip] = useState(null);
  const [singleResultData, setSingleResultData] = useState(null);
  const [multiResultsData, setMultiResultsData] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [particleTrigger, setParticleTrigger] = useState(0);
  const [showTutorial, setShowTutorial] = useState(!gameState.tutorialCompleted);

  const pendingRipRef = useRef(null);

  useEffect(() => {
    soundManager.setEnabled(gameState.settings.sound);
  }, [gameState.settings.sound]);

  useEffect(() => {
    saveState(gameState);
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape' || pendingRipRef.current) return;
      if (singleResultData) setSingleResultData(null);
      else if (multiResultsData) setMultiResultsData(null);
      else if (activeModal) setActiveModal(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      soundManager.stopStretch();
    };
  }, [singleResultData, multiResultsData, activeModal]);

  const checkAchievements = useCallback((newState) => {
    let updatedState = { ...newState };
    const achievementsMap = { ...updatedState.achievements };
    let updatedCoins = updatedState.coins;
    let hasNewUnlocked = false;

    const totalOpened = updatedState.stats.totalOpened;
    const unlockedItemsCount = Object.values(updatedState.items).filter((item) => item.unlocked).length;
    const totalItemsCount = Object.keys(updatedState.items).length;

    const unlock = (id) => {
      if (!achievementsMap[id] || achievementsMap[id].unlocked) return;
      achievementsMap[id] = {
        ...achievementsMap[id],
        unlocked: true,
        unlockedAt: Date.now()
      };
      updatedCoins += achievementsMap[id].reward;
      hasNewUnlocked = true;
      soundManager.playLegendary();
    };

    if (totalOpened >= 1) unlock('first_rip');
    if (totalOpened >= 10) unlock('rip_10');
    if (totalOpened >= 100) unlock('rip_100');
    if (unlockedItemsCount >= 10) unlock('collect_10');
    if (unlockedItemsCount === totalItemsCount) unlock('master_collector');
    if (updatedState.consecutiveCommon >= 10) unlock('unlucky_10');

    if (!hasNewUnlocked) return updatedState;

    return {
      ...updatedState,
      coins: updatedCoins,
      achievements: achievementsMap
    };
  }, []);

  const handleSelectBag = (bagId) => {
    if (isOpening) return;
    setGameState((previous) => ({ ...previous, selectedBagId: bagId }));
  };

  const beginRip = (bag, count = 1) => {
    if (isOpening || pendingRipRef.current) return;

    const totalCost = bag.cost * count;
    if (gameState.coins < totalCost) {
      alert(`Bạn cần ${totalCost} xu để xé ${count > 1 ? `${count} túi` : bag.name}.`);
      return;
    }

    const expGained = bag.expGain * count;
    const levelResult = addExp(gameState.level, gameState.exp, expGained);
    const nextState = {
      ...gameState,
      coins: gameState.coins - totalCost + levelResult.totalRewardCoins,
      level: levelResult.level,
      exp: levelResult.exp,
      selectedBagId: bag.id,
      stats: {
        ...gameState.stats,
        totalOpened: gameState.stats.totalOpened + count,
        totalSpent: gameState.stats.totalSpent + totalCost
      }
    };

    setGameState(nextState);
    saveState(nextState);

    const rip = {
      id: `${Date.now()}-${bag.id}-${count}`,
      bag,
      count,
      completed: false
    };
    pendingRipRef.current = rip;
    setPendingRip(rip);
    setIsOpening(true);

    if (levelResult.leveledUp) {
      window.setTimeout(() => {
        alert(`Đã lên Lv.${levelResult.level} và nhận ${levelResult.totalRewardCoins} xu thưởng.`);
      }, 80);
    }
  };

  const processRollResults = useCallback((bag, count) => {
    const currentGameState = loadState();
    let currentPity = {
      ...(currentGameState.pityMap[bag.id] || { rare: 0, epic: 0 })
    };
    const currentItemsMap = { ...currentGameState.items };
    let currentHistory = [...currentGameState.historyLog];
    const currentQuests = { ...currentGameState.quests };
    let currentConsecutiveCommon = currentGameState.consecutiveCommon;
    const results = [];

    const increaseQuest = (id, amount = 1) => {
      if (!currentQuests[id]) return;
      currentQuests[id] = {
        ...currentQuests[id],
        progress: currentQuests[id].progress + amount
      };
    };

    for (let index = 0; index < count; index += 1) {
      const rates = { ...bag.rates };
      if (currentPity.rare >= bag.pityRareMax) rates.Rare += 0.2;
      if (currentPity.epic >= bag.pityEpicMax) rates.Epic += 0.15;

      const roll = Math.random();
      let chosenRarity = 'Common';
      let cumulative = 0;

      if (roll < (cumulative += rates.Legendary)) chosenRarity = 'Legendary';
      else if (roll < (cumulative += rates.Epic)) chosenRarity = 'Epic';
      else if (roll < (cumulative += rates.Rare)) chosenRarity = 'Rare';

      const itemsOfRarity = Object.values(currentItemsMap).filter(
        (item) => item.rarity.toUpperCase() === chosenRarity.toUpperCase()
      );
      const selectedItem = itemsOfRarity.length
        ? itemsOfRarity[Math.floor(Math.random() * itemsOfRarity.length)]
        : Object.values(currentItemsMap)[0];

      const storedItem = currentItemsMap[selectedItem.id];
      const isFirstTime = !storedItem.unlocked;
      const newCount = storedItem.count + 1;

      currentItemsMap[selectedItem.id] = {
        ...storedItem,
        unlocked: true,
        count: newCount,
        firstObtainedAt: storedItem.firstObtainedAt || Date.now()
      };

      const isRarePlus = ['Rare', 'Epic', 'Legendary'].includes(chosenRarity);
      currentPity = {
        rare: isRarePlus ? 0 : currentPity.rare + 1,
        epic: ['Epic', 'Legendary'].includes(chosenRarity) ? 0 : currentPity.epic + 1
      };
      currentConsecutiveCommon = chosenRarity === 'Common' ? currentConsecutiveCommon + 1 : 0;

      increaseQuest('daily_rip3');
      increaseQuest('weekly_rip30');
      if (isFirstTime) increaseQuest('daily_new1');
      if (isRarePlus) increaseQuest('daily_rare1');

      currentHistory.unshift({
        id: Date.now() + index,
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

    currentHistory = currentHistory.slice(0, 50);

    const updatedState = checkAchievements({
      ...currentGameState,
      items: currentItemsMap,
      quests: currentQuests,
      historyLog: currentHistory,
      pityMap: {
        ...currentGameState.pityMap,
        [bag.id]: currentPity
      },
      consecutiveCommon: currentConsecutiveCommon
    });

    setGameState(updatedState);
    saveState(updatedState);
    setIsOpening(false);
    setParticleTrigger(Date.now());

    if (count === 1) {
      setSingleResultData(results[0]);
      if (results[0].item.rarity === 'Legendary') soundManager.playLegendary();
      else if (['Epic', 'Rare'].includes(results[0].item.rarity)) soundManager.playRare();
      else soundManager.playPop();
    } else {
      setMultiResultsData(results);
      const bestRarity = results.reduce((best, result) => {
        const order = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };
        return order[result.item.rarity] > order[best] ? result.item.rarity : best;
      }, 'Common');
      if (bestRarity === 'Legendary') soundManager.playLegendary();
      else soundManager.playRare();
    }
  }, [checkAchievements]);

  const completePendingRip = useCallback(() => {
    const rip = pendingRipRef.current;
    if (!rip || rip.completed) return;

    rip.completed = true;
    pendingRipRef.current = null;
    setPendingRip(null);
    processRollResults(rip.bag, rip.count);
  }, [processRollResults]);

  const handleDeconstructItem = (itemId) => {
    setGameState((previous) => {
      const item = previous.items[itemId];
      if (!item || item.count <= 1) return previous;
      soundManager.playCoin();
      return {
        ...previous,
        shards: previous.shards + 10,
        items: {
          ...previous.items,
          [itemId]: { ...item, count: item.count - 1 }
        }
      };
    });
  };

  const handleDeconstructAll = () => {
    setGameState((previous) => {
      let extraCount = 0;
      const updatedItems = { ...previous.items };

      Object.keys(updatedItems).forEach((id) => {
        if (updatedItems[id].count > 1) {
          extraCount += updatedItems[id].count - 1;
          updatedItems[id] = { ...updatedItems[id], count: 1 };
        }
      });

      if (!extraCount) return previous;
      soundManager.playCoin();
      return {
        ...previous,
        shards: previous.shards + extraCount * 10,
        items: updatedItems
      };
    });
  };

  const handleExchangeShards = (bagId, shardCost) => {
    if (gameState.shards < shardCost) {
      alert('Bạn không đủ Mảnh Vô Tri.');
      return;
    }
    const bag = BAGS.find((entry) => entry.id === bagId) || BAGS[0];
    setGameState((previous) => ({ ...previous, shards: previous.shards - shardCost }));
    beginRip(bag, 1);
  };

  const handleBuyShopItem = (shopItem) => {
    if (gameState.coins < shopItem.price) {
      alert('Bạn không đủ xu.');
      return;
    }
    soundManager.playCoin();
    setGameState((previous) => ({
      ...previous,
      coins: previous.coins - shopItem.price,
      shopOwned: [...previous.shopOwned, shopItem.id]
    }));
  };

  const handleClaimQuest = (questId) => {
    setGameState((previous) => {
      const quest = previous.quests[questId];
      if (!quest || quest.claimed || quest.progress < quest.target) return previous;
      soundManager.playCoin();
      return {
        ...previous,
        coins: previous.coins + quest.reward,
        quests: {
          ...previous.quests,
          [questId]: { ...quest, claimed: true }
        }
      };
    });
  };

  const handleClaimFreeCoins = () => {
    soundManager.playCoin();
    setGameState((previous) => ({
      ...previous,
      coins: previous.coins + 100,
      lastFreeClaimTime: Date.now()
    }));
  };

  const handleToggleFavorite = (itemId) => {
    setGameState((previous) => ({
      ...previous,
      items: {
        ...previous.items,
        [itemId]: {
          ...previous.items[itemId],
          isFavorite: !previous.items[itemId].isFavorite
        }
      }
    }));
  };

  const selectedBag = BAGS.find((bag) => bag.id === gameState.selectedBagId) || BAGS[0];
  const unlockedCount = Object.values(gameState.items).filter((item) => item.unlocked).length;
  const totalItemsCount = Object.keys(gameState.items).length;

  return (
    <div className="app-container" style={{ padding: '1.2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '100vh', justifyContent: 'space-between', gap: '1.5rem' }}>
      {showTutorial && (
        <TutorialOverlay
          onComplete={() => {
            setShowTutorial(false);
            setGameState((previous) => ({ ...previous, tutorialCompleted: true }));
          }}
        />
      )}

      {pendingRip && (
        <UnboxingStage
          key={pendingRip.id}
          bag={pendingRip.bag}
          count={pendingRip.count}
          onComplete={completePendingRip}
          onSkip={completePendingRip}
        />
      )}

      {singleResultData && (
        <ParticlesCanvas
          trigger={particleTrigger}
          rarity={singleResultData.item.rarity}
          enabled={gameState.settings.particles}
        />
      )}

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
        onToggleSound={() => setGameState((previous) => ({
          ...previous,
          settings: { ...previous.settings, sound: !previous.settings.sound }
        }))}
      />

      <main style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <BagSelector
          selectedBagId={gameState.selectedBagId}
          onSelectBag={handleSelectBag}
          onRipBag={beginRip}
          isOpening={isOpening}
          coins={gameState.coins}
          playerLevel={gameState.level}
          pityMap={gameState.pityMap}
        />
      </main>

      {singleResultData && (
        <ResultModal
          resultData={singleResultData}
          onClose={() => setSingleResultData(null)}
          onRipAgain={() => {
            setSingleResultData(null);
            beginRip(selectedBag, 1);
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
            const count = multiResultsData.length;
            setMultiResultsData(null);
            beginRip(selectedBag, count);
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
          onUpdateProfile={(profile) => setGameState((previous) => ({ ...previous, profile }))}
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
          onClearHistory={() => setGameState((previous) => ({ ...previous, historyLog: [] }))}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'settings' && (
        <SettingsModal
          settings={gameState.settings}
          performanceMode={gameState.performanceMode}
          onToggleSound={() => setGameState((previous) => ({
            ...previous,
            settings: { ...previous.settings, sound: !previous.settings.sound }
          }))}
          onToggleParticles={() => setGameState((previous) => ({
            ...previous,
            settings: { ...previous.settings, particles: !previous.settings.particles }
          }))}
          onChangePerformanceMode={(performanceMode) => setGameState((previous) => ({ ...previous, performanceMode }))}
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
              alert('Nhập dữ liệu thành công.');
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

      <footer style={{ fontSize: '0.76rem', color: '#64748b', textAlign: 'center', padding: '6px 0 12px' }}>
        Xé Túi Mù Vô Tri v3.0 · Interactive Tear Edition · Tự động lưu
      </footer>
    </div>
  );
}
