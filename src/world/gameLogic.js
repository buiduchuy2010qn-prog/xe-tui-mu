import { addExp } from '../utils/level';

export const RARITY_ORDER = { Common: 0, Rare: 1, Epic: 2, Legendary: 3 };
export const QUANTITIES = [1, 5, 10];
export const FREE_COIN_COOLDOWN = 4 * 60 * 60 * 1000;
export const LUCKY_COOLDOWN = 60 * 60 * 1000;
export const COIN_RUSH_LIMIT = 5;
export const DAILY_REWARDS = [100, 140, 190, 250, 330, 430, 600];

export const formatNumber = (value) => new Intl.NumberFormat('vi-VN').format(value || 0);
export const dayKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
export const formatDuration = (milliseconds) => {
  if (milliseconds <= 0) return '';
  const hours = Math.floor(milliseconds / 3600000);
  const minutes = Math.floor((milliseconds % 3600000) / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}`
    : `${minutes}:${String(seconds).padStart(2, '0')}`;
};

function pickWeightedRarity(rates) {
  const entries = ['Legendary', 'Epic', 'Rare', 'Common'].map((rarity) => [
    rarity,
    Math.max(0, Number(rates[rarity]) || 0)
  ]);
  const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = Math.random() * (total || 1);

  for (const [rarity, weight] of entries) {
    cursor -= weight;
    if (cursor <= 0) return rarity;
  }
  return 'Common';
}

export function increaseQuestProgress(quests, questId, amount) {
  const quest = quests[questId];
  if (!quest) return quests;
  return {
    ...quests,
    [questId]: {
      ...quest,
      progress: Math.min(quest.target, (quest.progress || 0) + amount)
    }
  };
}

export function grantEarnedCoins(state, amount, economyPatch = {}) {
  const reward = Math.max(0, Math.round(amount));
  let quests = { ...state.quests };
  quests = increaseQuestProgress(quests, 'weekly_earn500', reward);

  return {
    ...state,
    coins: state.coins + reward,
    quests,
    economy: {
      ...state.economy,
      totalEarned: (state.economy?.totalEarned || 0) + reward,
      ...economyPatch
    }
  };
}

function unlockAchievements(state) {
  const achievements = { ...state.achievements };
  const unlockedItems = Object.values(state.items).filter((item) => item.unlocked).length;
  const totalItems = Object.keys(state.items).length;
  const newlyUnlocked = [];
  let coins = state.coins;

  const unlock = (id) => {
    const achievement = achievements[id];
    if (!achievement || achievement.unlocked) return;
    achievements[id] = { ...achievement, unlocked: true, unlockedAt: Date.now() };
    coins += Number(achievement.reward) || 0;
    newlyUnlocked.push(achievement.name || 'Thành tích mới');
  };

  if (state.stats.totalOpened >= 1) unlock('first_rip');
  if (state.stats.totalOpened >= 10) unlock('rip_10');
  if (state.stats.totalOpened >= 100) unlock('rip_100');
  if (unlockedItems >= 10) unlock('collect_10');
  if (unlockedItems === totalItems) unlock('master_collector');
  if (state.consecutiveCommon >= 10) unlock('unlucky_10');

  return {
    state: { ...state, coins, achievements },
    newlyUnlocked
  };
}

export function buildOpenBundle(state, bag, count) {
  const totalCost = bag.cost * count;
  const items = { ...state.items };
  let quests = Object.fromEntries(
    Object.entries(state.quests).map(([id, quest]) => [id, { ...quest }])
  );
  const pity = { ...(state.pityMap[bag.id] || { rare: 0, epic: 0 }) };
  const history = [...state.historyLog];
  const results = [];
  let consecutiveCommon = state.consecutiveCommon || 0;

  for (let index = 0; index < count; index += 1) {
    const rates = { ...bag.rates };
    if (pity.rare >= bag.pityRareMax) rates.Rare += 0.2;
    if (pity.epic >= bag.pityEpicMax) rates.Epic += 0.15;

    const rarity = pickWeightedRarity(rates);
    const pool = Object.values(items).filter((item) => item.rarity === rarity);
    const selected = pool[Math.floor(Math.random() * pool.length)] || Object.values(items)[0];
    const stored = items[selected.id];
    const isNew = !stored.unlocked;
    const totalCount = (stored.count || 0) + 1;

    items[selected.id] = {
      ...stored,
      unlocked: true,
      count: totalCount,
      firstObtainedAt: stored.firstObtainedAt || Date.now()
    };

    const rarePlus = ['Rare', 'Epic', 'Legendary'].includes(rarity);
    pity.rare = rarePlus ? 0 : pity.rare + 1;
    pity.epic = ['Epic', 'Legendary'].includes(rarity) ? 0 : pity.epic + 1;
    consecutiveCommon = rarity === 'Common' ? consecutiveCommon + 1 : 0;

    quests = increaseQuestProgress(quests, 'daily_rip3', 1);
    quests = increaseQuestProgress(quests, 'weekly_rip30', 1);
    if (isNew) quests = increaseQuestProgress(quests, 'daily_new1', 1);
    if (rarePlus) quests = increaseQuestProgress(quests, 'daily_rare1', 1);

    const resultItem = { ...items[selected.id] };
    results.push({ item: resultItem, isNew, totalCount });
    history.unshift({
      id: `${Date.now()}-${index}`,
      timestamp: Date.now(),
      bagName: bag.name,
      cost: bag.cost,
      item: resultItem,
      rarity,
      isNew
    });
  }

  const unlockedCount = Object.values(items).filter((item) => item.unlocked).length;
  if (quests.weekly_collect10) {
    quests.weekly_collect10 = {
      ...quests.weekly_collect10,
      progress: Math.min(quests.weekly_collect10.target, unlockedCount)
    };
  }

  const levelResult = addExp(state.level, state.exp, bag.expGain * count);
  const nextState = {
    ...state,
    coins: state.coins - totalCost + levelResult.totalRewardCoins,
    level: levelResult.level,
    exp: levelResult.exp,
    selectedBagId: bag.id,
    items,
    quests,
    pityMap: { ...state.pityMap, [bag.id]: pity },
    consecutiveCommon,
    historyLog: history.slice(0, 60),
    stats: {
      ...state.stats,
      totalOpened: state.stats.totalOpened + count,
      totalSpent: state.stats.totalSpent + totalCost
    }
  };

  const achievementResult = unlockAchievements(nextState);
  return {
    nextState: achievementResult.state,
    results,
    levelResult,
    achievements: achievementResult.newlyUnlocked
  };
}
