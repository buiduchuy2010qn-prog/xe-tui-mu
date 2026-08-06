import React, { useEffect, useState } from 'react';
import './index.css';
import './App.css';
import './world/world.css';

import { BAGS } from './data/bags';
import { CatchBagGame } from './world/CatchBagGame';
import { HomeArena } from './world/HomeArena';
import { EarnCoinsPanel, InventoryPanel, MissionsPanel, SettingsPanel, Toast, Tutorial } from './world/Panels';
import { RevealStage } from './world/Results';
import { TopBar } from './world/TopBar';
import { WorldUnboxingStage } from './world/WorldUnboxingStage';
import {
  COIN_RUSH_LIMIT,
  DAILY_REWARDS,
  FREE_COIN_COOLDOWN,
  LUCKY_COOLDOWN,
  buildOpenBundle,
  dayKey,
  formatDuration,
  grantEarnedCoins,
  increaseQuestProgress
} from './world/gameLogic';
import {
  exportSaveJson,
  importSaveJson,
  loadState,
  resetState,
  saveState
} from './utils/storage';
import { soundManager } from './utils/sound';

function yesterdayKey() {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return dayKey(yesterday);
}

export default function App() {
  const [gameState, setGameState] = useState(() => loadState());
  const [quantity, setQuantity] = useState(1);
  const [activePanel, setActivePanel] = useState(null);
  const [pendingOpen, setPendingOpen] = useState(null);
  const [revealBundle, setRevealBundle] = useState(null);
  const [showTutorial, setShowTutorial] = useState(() => !loadState().tutorialCompleted);
  const [showCatchGame, setShowCatchGame] = useState(false);
  const [toast, setToast] = useState('');
  const [clock, setClock] = useState(Date.now());

  useEffect(() => saveState(gameState), [gameState]);
  useEffect(() => soundManager.setEnabled(gameState.settings.sound), [gameState.settings.sound]);
  useEffect(() => {
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => {
      window.clearInterval(timer);
      soundManager.stopStretch();
    };
  }, []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    const openMissions = () => setActivePanel('missions');
    window.addEventListener('open-missions', openMissions);
    return () => window.removeEventListener('open-missions', openMissions);
  }, []);

  const selectedBag = BAGS.find((bag) => bag.id === gameState.selectedBagId) || BAGS[0];
  const freeRemainingMs = Math.max(0, FREE_COIN_COOLDOWN - (clock - (gameState.lastFreeClaimTime || 0)));
  const luckyRemainingMs = Math.max(0, LUCKY_COOLDOWN - (clock - (gameState.economy?.lastLuckyAt || 0)));
  const today = dayKey();
  const catchPlaysUsed = gameState.economy?.coinRushDay === today ? gameState.economy.coinRushPlays || 0 : 0;
  const catchPlaysLeft = Math.max(0, COIN_RUSH_LIMIT - catchPlaysUsed);

  const openBag = (bag, count) => {
    if (pendingOpen || showCatchGame) return;
    if (gameState.level < bag.minLevel) {
      setToast(`Cần đạt cấp ${bag.minLevel}`);
      return;
    }
    if (gameState.coins < bag.cost * count) {
      setToast('Không đủ xu · hãy vào khu Kiếm Xu');
      setActivePanel('earn');
      return;
    }

    const bundle = buildOpenBundle(gameState, bag, count);
    setGameState(bundle.nextState);
    saveState(bundle.nextState);
    setPendingOpen({
      id: `${Date.now()}-${bag.id}`,
      bag,
      count,
      results: bundle.results
    });

    if (bundle.levelResult.leveledUp) {
      setToast(`Lên Lv.${bundle.levelResult.level} · +${bundle.levelResult.totalRewardCoins} xu`);
    } else if (bundle.achievements.length) {
      setToast(`Mở khóa: ${bundle.achievements[0]}`);
    }
  };

  const finishTear = () => {
    if (!pendingOpen) return;
    const bundle = pendingOpen;
    setPendingOpen(null);
    setRevealBundle(bundle);
  };

  const claimQuest = (questId) => {
    setGameState((state) => {
      const quest = state.quests[questId];
      if (!quest || quest.claimed || quest.progress < quest.target) return state;
      soundManager.playCoin();
      const withClaim = {
        ...state,
        quests: {
          ...state.quests,
          [questId]: { ...quest, claimed: true }
        }
      };
      return grantEarnedCoins(withClaim, quest.reward);
    });
    const reward = gameState.quests[questId]?.reward;
    if (reward) setToast(`Đã nhận ${reward} xu`);
  };

  const claimFree = () => {
    if (freeRemainingMs > 0) return;
    soundManager.playCoin();
    setGameState((state) => grantEarnedCoins({ ...state, lastFreeClaimTime: Date.now() }, 100));
    setClock(Date.now());
    setToast('Đã nhận 100 xu miễn phí');
  };

  const claimDaily = () => {
    if (gameState.economy?.dailyClaimKey === today) return;
    const previousKey = gameState.economy?.dailyClaimKey;
    const previousStreak = gameState.economy?.dailyStreak || 0;
    const nextStreak = previousKey === yesterdayKey() ? (previousStreak % 7) + 1 : 1;
    const reward = DAILY_REWARDS[nextStreak - 1];

    soundManager.playCoin();
    setGameState((state) => grantEarnedCoins(state, reward, {
      dailyStreak: nextStreak,
      dailyClaimKey: today,
      lastDailyClaimAt: Date.now()
    }));
    setToast(`Điểm danh ngày ${nextStreak} · +${reward} xu`);
  };

  const claimLucky = () => {
    if (luckyRemainingMs > 0) return;
    const reward = 25 + Math.floor(Math.random() * 156);
    soundManager.playRare();
    setGameState((state) => grantEarnedCoins(state, reward, { lastLuckyAt: Date.now() }));
    setClock(Date.now());
    setToast(`Phong bì may mắn: +${reward} xu`);
  };

  const finishCatchGame = ({ coins, caught, bestCombo }) => {
    setGameState((state) => {
      const day = dayKey();
      const used = state.economy?.coinRushDay === day ? state.economy.coinRushPlays || 0 : 0;
      let next = grantEarnedCoins(state, coins, {
        coinRushDay: day,
        coinRushPlays: Math.min(COIN_RUSH_LIMIT, used + 1),
        totalCaught: (state.economy?.totalCaught || 0) + caught,
        bestCatchCombo: Math.max(state.economy?.bestCatchCombo || 0, bestCombo)
      });
      next = {
        ...next,
        quests: increaseQuestProgress(next.quests, 'daily_catch10', caught)
      };
      return next;
    });
    setToast(`Bắt được ${caught} túi · +${coins} xu`);
  };

  const sellDuplicate = (itemId, value) => {
    setGameState((state) => {
      const item = state.items[itemId];
      if (!item || item.count <= 1) return state;
      const withItem = {
        ...state,
        items: {
          ...state.items,
          [itemId]: { ...item, count: item.count - 1 }
        }
      };
      return grantEarnedCoins(withItem, value);
    });
    soundManager.playCoin();
    setToast(`Đã bán đồ trùng · +${value} xu`);
  };

  const sellAllDuplicates = () => {
    let totalValue = 0;
    setGameState((state) => {
      const items = { ...state.items };
      Object.keys(items).forEach((id) => {
        const item = items[id];
        const duplicates = Math.max(0, (item.count || 0) - 1);
        if (!duplicates) return;
        const unitValue = Math.max(1, Math.round((item.value || 5) * 0.6));
        totalValue += duplicates * unitValue;
        items[id] = { ...item, count: 1 };
      });
      return totalValue > 0 ? grantEarnedCoins({ ...state, items }, totalValue) : state;
    });
    if (totalValue > 0) {
      soundManager.playCoin();
      setToast(`Đã bán tất cả đồ trùng · +${totalValue} xu`);
    }
  };

  const toggleFavorite = (itemId) => setGameState((state) => ({
    ...state,
    items: {
      ...state.items,
      [itemId]: {
        ...state.items[itemId],
        isFavorite: !state.items[itemId].isFavorite
      }
    }
  }));

  const completeTutorial = () => {
    setShowTutorial(false);
    setGameState((state) => ({ ...state, tutorialCompleted: true }));
  };

  const resetGame = () => {
    if (!window.confirm('Xóa toàn bộ xu, vật phẩm và tiến trình?')) return;
    const fresh = resetState();
    setGameState(fresh);
    setActivePanel(null);
    setRevealBundle(null);
    setPendingOpen(null);
    setShowCatchGame(false);
    setShowTutorial(true);
  };

  return (
    <div className="app-root world-pack-app">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="page-noise" />
      <TopBar
        state={gameState}
        onPanel={setActivePanel}
        onToggleSound={() => setGameState((state) => ({ ...state, settings: { ...state.settings, sound: !state.settings.sound } }))}
      />
      <HomeArena
        state={gameState}
        selectedBag={selectedBag}
        quantity={quantity}
        onQuantity={setQuantity}
        onSelectBag={(id) => setGameState((state) => ({ ...state, selectedBagId: id }))}
        onOpen={openBag}
        onClaimFree={claimFree}
        freeRemaining={formatDuration(freeRemainingMs)}
        onEarn={() => setActivePanel('earn')}
      />
      <footer className="game-footer"><span>Xé Túi Mù Vô Tri · World Pack</span><span>Dữ liệu tự động lưu trên thiết bị</span></footer>

      {pendingOpen && <WorldUnboxingStage key={pendingOpen.id} bag={pendingOpen.bag} count={pendingOpen.count} onComplete={finishTear} />}
      {revealBundle && <RevealStage bundle={revealBundle} particlesEnabled={gameState.settings.particles} onClose={() => setRevealBundle(null)} onInventory={() => { setRevealBundle(null); setActivePanel('inventory'); }} onOpenAgain={() => { const bundle = revealBundle; setRevealBundle(null); window.setTimeout(() => openBag(bundle.bag, bundle.count), 0); }} />}
      {showCatchGame && <CatchBagGame playsLeft={catchPlaysLeft} onFinish={finishCatchGame} onClose={() => setShowCatchGame(false)} />}

      {activePanel === 'inventory' && <InventoryPanel state={gameState} onClose={() => setActivePanel(null)} onToggleFavorite={toggleFavorite} onSellDuplicate={sellDuplicate} onSellAllDuplicates={sellAllDuplicates} />}
      {activePanel === 'missions' && <MissionsPanel state={gameState} onClose={() => setActivePanel(null)} onClaim={claimQuest} />}
      {activePanel === 'earn' && <EarnCoinsPanel state={gameState} onClose={() => setActivePanel(null)} onStartCatch={() => { setActivePanel(null); setShowCatchGame(true); }} onDailyClaim={claimDaily} onLuckyClaim={claimLucky} onFreeClaim={claimFree} onSellAllDuplicates={sellAllDuplicates} freeRemaining={formatDuration(freeRemainingMs)} luckyRemaining={formatDuration(luckyRemainingMs)} catchPlaysLeft={catchPlaysLeft} />}
      {activePanel === 'settings' && <SettingsPanel state={gameState} onClose={() => setActivePanel(null)} onToggleSound={() => setGameState((state) => ({ ...state, settings: { ...state.settings, sound: !state.settings.sound } }))} onToggleParticles={() => setGameState((state) => ({ ...state, settings: { ...state.settings, particles: !state.settings.particles } }))} onTutorial={() => { setActivePanel(null); setShowTutorial(true); }} onExport={() => exportSaveJson(gameState)} onImport={(text) => { const imported = importSaveJson(text); if (imported) { setGameState(imported); setActivePanel(null); setToast('Đã nhập dữ liệu thành công'); } }} onReset={resetGame} />}
      {showTutorial && <Tutorial onComplete={completeTutorial} />}
      <Toast message={toast} />
    </div>
  );
}
