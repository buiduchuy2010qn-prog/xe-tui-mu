export const getExpForLevel = (level) => {
  return level * 100;
};

export const addExp = (currentLevel, currentExp, gainedExp) => {
  let level = currentLevel;
  let exp = currentExp + gainedExp;
  let totalRewardCoins = 0;
  let leveledUp = false;

  while (exp >= getExpForLevel(level)) {
    exp -= getExpForLevel(level);
    level += 1;
    totalRewardCoins += level * 50;
    leveledUp = true;
  }

  return {
    level,
    exp,
    leveledUp,
    totalRewardCoins
  };
};
