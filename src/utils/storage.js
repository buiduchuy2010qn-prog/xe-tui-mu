import { ACHIEVEMENTS } from '../data/achievements';
import { BAGS } from '../data/bags';
import { INITIAL_ITEMS } from '../data/items';

const STORAGE_KEY = 'xe_tui_mu_save_v5';
const LEGACY_KEYS = ['xe_tui_mu_save_v2_5', 'xe_tui_mu_save_v2'];
export const CURRENT_SAVE_VERSION = '5.0';

const createPityMap = () => Object.fromEntries(BAGS.map((bag) => [bag.id, { rare: 0, epic: 0 }]));

export const getDefaultState = () => {
  const itemsMap = Object.fromEntries(INITIAL_ITEMS.map((item) => [item.id, {
    ...item,
    count: 0,
    unlocked: false,
    firstObtainedAt: null,
    isFavorite: false
  }]));

  const achievementsMap = Object.fromEntries(ACHIEVEMENTS.map((achievement) => [achievement.id, {
    ...achievement,
    unlocked: false,
    unlockedAt: null
  }]));

  return {
    saveVersion: CURRENT_SAVE_VERSION,
    coins: 300,
    shards: 0,
    level: 1,
    exp: 0,
    selectedBagId: BAGS[0].id,
    items: itemsMap,
    achievements: achievementsMap,
    pityMap: createPityMap(),
    consecutiveCommon: 0,
    lastFreeClaimTime: 0,
    dailyResetTime: Date.now(),
    weeklyResetTime: Date.now(),
    historyLog: [],
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
    performanceMode: 'high',
    settings: {
      sound: true,
      particles: true
    },
    economy: {
      totalEarned: 0,
      dailyStreak: 0,
      dailyClaimKey: '',
      lastDailyClaimAt: 0,
      lastLuckyAt: 0,
      coinRushDay: '',
      coinRushPlays: 0,
      totalCaught: 0,
      bestCatchCombo: 0
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
      daily_catch10: { id: 'daily_catch10', type: 'daily', name: 'Bắt 10 túi trong mini-game', target: 10, progress: 0, reward: 130, claimed: false },
      weekly_rip30: { id: 'weekly_rip30', type: 'weekly', name: 'Xé 30 túi mù trong tuần', target: 30, progress: 0, reward: 400, claimed: false },
      weekly_collect10: { id: 'weekly_collect10', type: 'weekly', name: 'Thu thập 10 vật phẩm khác nhau', target: 10, progress: 0, reward: 500, claimed: false },
      weekly_earn500: { id: 'weekly_earn500', type: 'weekly', name: 'Kiếm 500 xu từ hoạt động', target: 500, progress: 0, reward: 350, claimed: false }
    }
  };
};

export const sanitizeState = (rawState) => {
  const defaults = getDefaultState();
  if (!rawState || typeof rawState !== 'object') return defaults;

  let coins = Number(rawState.coins);
  if (!Number.isFinite(coins) || coins < 0 || coins > 99999999) coins = defaults.coins;
  const level = Math.max(1, Math.min(100, Number(rawState.level) || 1));
  const exp = Math.max(0, Number(rawState.exp) || 0);
  const shards = Math.max(0, Number(rawState.shards) || 0);

  const items = { ...defaults.items };
  if (rawState.items && typeof rawState.items === 'object') {
    Object.keys(rawState.items).forEach((id) => {
      if (!items[id]) return;
      items[id] = {
        ...items[id],
        count: Math.max(0, Math.min(99999, Number(rawState.items[id].count) || 0)),
        unlocked: Boolean(rawState.items[id].unlocked),
        firstObtainedAt: rawState.items[id].firstObtainedAt || null,
        isFavorite: Boolean(rawState.items[id].isFavorite)
      };
    });
  }

  const achievements = { ...defaults.achievements };
  if (rawState.achievements && typeof rawState.achievements === 'object') {
    Object.keys(rawState.achievements).forEach((id) => {
      if (!achievements[id]) return;
      achievements[id] = {
        ...achievements[id],
        unlocked: Boolean(rawState.achievements[id].unlocked),
        unlockedAt: rawState.achievements[id].unlockedAt || null
      };
    });
  }

  const quests = Object.fromEntries(Object.entries(defaults.quests).map(([id, quest]) => {
    const saved = rawState.quests?.[id] || {};
    return [id, {
      ...quest,
      progress: Math.max(0, Math.min(quest.target, Number(saved.progress) || 0)),
      claimed: Boolean(saved.claimed)
    }];
  }));

  const pityMap = createPityMap();
  Object.keys(pityMap).forEach((id) => {
    const saved = rawState.pityMap?.[id];
    if (!saved) return;
    pityMap[id] = {
      rare: Math.max(0, Number(saved.rare) || 0),
      epic: Math.max(0, Number(saved.epic) || 0)
    };
  });

  const selectedBagId = BAGS.some((bag) => bag.id === rawState.selectedBagId)
    ? rawState.selectedBagId
    : defaults.selectedBagId;

  return {
    ...defaults,
    ...rawState,
    saveVersion: CURRENT_SAVE_VERSION,
    coins,
    level,
    exp,
    shards,
    selectedBagId,
    items,
    achievements,
    quests,
    pityMap,
    profile: { ...defaults.profile, ...(rawState.profile || {}) },
    settings: { ...defaults.settings, ...(rawState.settings || {}) },
    economy: { ...defaults.economy, ...(rawState.economy || {}) },
    stats: { ...defaults.stats, ...(rawState.stats || {}) },
    historyLog: Array.isArray(rawState.historyLog) ? rawState.historyLog.slice(0, 60) : []
  };
};

export const loadState = () => {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const key of LEGACY_KEYS) {
        raw = localStorage.getItem(key);
        if (raw) break;
      }
    }
    return raw ? sanitizeState(JSON.parse(raw)) : getDefaultState();
  } catch (error) {
    console.error('Failed to load state from localStorage', error);
    return getDefaultState();
  }
};

export const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitizeState(state)));
  } catch (error) {
    console.error('Failed to save state to localStorage', error);
  }
};

export const resetState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to reset state', error);
  }
  return getDefaultState();
};

export const exportSaveJson = (state) => {
  const blob = new Blob([JSON.stringify(sanitizeState(state), null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = `xe_tui_mu_save_v${CURRENT_SAVE_VERSION}_${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
};

export const importSaveJson = (jsonText) => {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid save');
    return sanitizeState(parsed);
  } catch (error) {
    alert('File JSON không hợp lệ hoặc bị lỗi định dạng.');
    return null;
  }
};
