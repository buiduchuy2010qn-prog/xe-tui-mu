import { INITIAL_ITEMS } from '../data/items';
import { ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY = 'xe_tui_mu_save_v2_5';
const OLD_STORAGE_KEY = 'xe_tui_mu_save_v2';
export const CURRENT_SAVE_VERSION = '2.5';

export const getDefaultState = () => {
  const itemsMap = {};
  INITIAL_ITEMS.forEach(item => {
    itemsMap[item.id] = {
      ...item,
      count: 0,
      unlocked: false,
      firstObtainedAt: null,
      isFavorite: false
    };
  });

  const achievementsMap = {};
  ACHIEVEMENTS.forEach(ach => {
    achievementsMap[ach.id] = {
      ...ach,
      unlocked: false,
      unlockedAt: null
    };
  });

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    coins: 300,
    shards: 0, // Mảnh Vô Tri
    level: 1,
    exp: 0,
    selectedBagId: 'trash_bag',
    items: itemsMap,
    achievements: achievementsMap,
    pityMap: {
      trash_bag: { rare: 0, epic: 0 },
      nylon_bag: { rare: 0, epic: 0 },
      rich_bag: { rare: 0, epic: 0 },
      event_tet: { rare: 0, epic: 0 }
    },
    consecutiveCommon: 0,
    lastFreeClaimTime: 0,
    dailyResetTime: Date.now(),
    weeklyResetTime: Date.now(),
    historyLog: [], // max 50 entries
    profile: {
      playerName: 'Tập Sự Vô Tri',
      avatar: '🐱',
      frame: null,
      title: 'Tập Sự Vô Tri 🎒',
      showcaseItemIds: []
    },
    shopOwned: [],
    activeEffect: null,
    tutorialCompleted: false,
    performanceMode: 'auto',
    settings: {
      sound: true,
      particles: true
    },
    stats: {
      totalOpened: 0,
      totalSpent: 0,
      joinDate: Date.now()
    },
    quests: {
      daily_rip3: { id: 'daily_rip3', type: 'daily', name: 'Xé 3 túi mù bất kỳ', target: 3, progress: 0, reward: 50, claimed: false },
      daily_new1: { id: 'daily_new1', type: 'daily', name: 'Nhận 1 vật phẩm mới', target: 1, progress: 0, reward: 80, claimed: false },
      daily_rare1: { id: 'daily_rare1', type: 'daily', name: 'Mở 1 vật phẩm Hiếm trở lên', target: 1, progress: 0, reward: 120, claimed: false },
      weekly_rip30: { id: 'weekly_rip30', type: 'weekly', name: 'Xé 30 túi mù trong tuần', target: 30, progress: 0, reward: 400, claimed: false },
      weekly_collect10: { id: 'weekly_collect10', type: 'weekly', name: 'Thu thập 10 vật phẩm khác nhau', target: 10, progress: 0, reward: 500, claimed: false }
    }
  };
};

export const sanitizeState = (rawState) => {
  const defaultState = getDefaultState();
  if (!rawState || typeof rawState !== 'object') return defaultState;

  // Anti-cheat & Bounds check
  let coins = Number(rawState.coins);
  if (isNaN(coins) || coins < 0 || coins > 99999999) coins = defaultState.coins;

  let level = Math.max(1, Math.min(100, Number(rawState.level) || 1));
  let exp = Math.max(0, Number(rawState.exp) || 0);
  let shards = Math.max(0, Number(rawState.shards) || 0);

  // Merge items
  const mergedItems = { ...defaultState.items };
  if (rawState.items && typeof rawState.items === 'object') {
    Object.keys(rawState.items).forEach(id => {
      if (mergedItems[id]) {
        mergedItems[id] = {
          ...mergedItems[id],
          count: Math.max(0, Number(rawState.items[id].count) || 0),
          unlocked: Boolean(rawState.items[id].unlocked),
          firstObtainedAt: rawState.items[id].firstObtainedAt || null,
          isFavorite: Boolean(rawState.items[id].isFavorite)
        };
      }
    });
  }

  // Merge achievements
  const mergedAchievements = { ...defaultState.achievements };
  if (rawState.achievements && typeof rawState.achievements === 'object') {
    Object.keys(rawState.achievements).forEach(id => {
      if (mergedAchievements[id]) {
        mergedAchievements[id] = {
          ...mergedAchievements[id],
          unlocked: Boolean(rawState.achievements[id].unlocked),
          unlockedAt: rawState.achievements[id].unlockedAt || null
        };
      }
    });
  }

  // Merge quests
  const mergedQuests = { ...defaultState.quests, ...(rawState.quests || {}) };

  return {
    ...defaultState,
    ...rawState,
    saveVersion: CURRENT_SAVE_VERSION,
    coins,
    level,
    exp,
    shards,
    items: mergedItems,
    achievements: mergedAchievements,
    quests: mergedQuests,
    pityMap: { ...defaultState.pityMap, ...(rawState.pityMap || {}) },
    profile: { ...defaultState.profile, ...(rawState.profile || {}) },
    settings: { ...defaultState.settings, ...(rawState.settings || {}) },
    stats: { ...defaultState.stats, ...(rawState.stats || {}) }
  };
};

export const loadState = () => {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Try migrating from v2
      const v2Raw = localStorage.getItem(OLD_STORAGE_KEY);
      if (v2Raw) {
        raw = v2Raw;
      }
    }
    if (!raw) return getDefaultState();

    const parsed = JSON.parse(raw);
    return sanitizeState(parsed);
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
    return getDefaultState();
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }
};

export const resetState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to reset state', e);
  }
  return getDefaultState();
};

export const exportSaveJson = (state) => {
  const jsonStr = JSON.stringify(state, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `xe_tui_mu_save_v${CURRENT_SAVE_VERSION}_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importSaveJson = (jsonText) => {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON format');
    return sanitizeState(parsed);
  } catch (e) {
    alert('File JSON không hợp lệ hoặc bị lỗi định dạng!');
    return null;
  }
};
