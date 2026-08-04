import { INITIAL_ITEMS } from '../data/items';
import { ACHIEVEMENTS } from '../data/achievements';

const STORAGE_KEY = 'xe_tui_mu_save_v2';

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
    coins: 300,
    selectedBagId: 'trash_bag',
    items: itemsMap,
    achievements: achievementsMap,
    pityCounter: 0, // counts consecutive non-rare+ opens
    consecutiveCommon: 0, // counts consecutive common opens
    lastFreeClaimTime: 0,
    settings: {
      sound: true,
      particles: true
    },
    stats: {
      totalOpened: 0,
      totalSpent: 0
    },
    quests: {
      rip3: { id: 'rip3', name: 'Xé 3 túi mù bất kỳ', target: 3, progress: 0, reward: 50, claimed: false },
      new3: { id: 'new3', name: 'Mở được 2 vật phẩm mới', target: 2, progress: 0, reward: 100, claimed: false },
      rare1: { id: 'rare1', name: 'Mở được 1 vật phẩm Hiếm trở lên', target: 1, progress: 0, reward: 150, claimed: false }
    }
  };
};

export const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);

    // Merge with default state to prevent broken state if schema updates
    const defaultState = getDefaultState();
    
    // Ensure all items exist in items map
    const mergedItems = { ...defaultState.items };
    if (parsed.items) {
      Object.keys(parsed.items).forEach(id => {
        if (mergedItems[id]) {
          mergedItems[id] = { ...mergedItems[id], ...parsed.items[id] };
        }
      });
    }

    // Ensure all achievements exist
    const mergedAchievements = { ...defaultState.achievements };
    if (parsed.achievements) {
      Object.keys(parsed.achievements).forEach(id => {
        if (mergedAchievements[id]) {
          mergedAchievements[id] = { ...mergedAchievements[id], ...parsed.achievements[id] };
        }
      });
    }

    // Ensure quests exist
    const mergedQuests = { ...defaultState.quests, ...(parsed.quests || {}) };

    return {
      ...defaultState,
      ...parsed,
      items: mergedItems,
      achievements: mergedAchievements,
      quests: mergedQuests,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) },
      stats: { ...defaultState.stats, ...(parsed.stats || {}) }
    };
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
  a.download = `xe_tui_mu_save_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importSaveJson = (jsonText) => {
  try {
    const parsed = JSON.parse(jsonText);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid JSON format');
    return parsed;
  } catch (e) {
    alert('File JSON không hợp lệ!');
    return null;
  }
};
