export const LEVEL_THRESHOLDS = (() => {
  const thresholds = [0, 100, 250, 500, 900, 1400, 2000, 2800, 3800, 5000];
  let lastDiff = 1200;
  let lastVal = 5000;

  for (let i = 10; i < 100; i += 1) {
    lastDiff += 200;
    lastVal += lastDiff;
    thresholds.push(lastVal);
  }

  return thresholds;
})();

export const getLevelProgress = (xp = 0) => {
  const safeXP = Math.max(0, Number(xp) || 0);
  let level = 1;

  while (level < LEVEL_THRESHOLDS.length && safeXP >= LEVEL_THRESHOLDS[level]) {
    level += 1;
  }

  const currentLevelXp = level > 1 ? LEVEL_THRESHOLDS[level - 1] : 0;
  const nextLevelXp = level < LEVEL_THRESHOLDS.length ? LEVEL_THRESHOLDS[level] : currentLevelXp;

  return {
    level,
    currentLevelXp,
    nextLevelXp,
    xpToNextLevel: level < LEVEL_THRESHOLDS.length ? Math.max(0, nextLevelXp - safeXP) : 0,
  };
};

export const normalizeUserStats = (stats) => {
  if (!stats) return stats;

  return {
    ...stats,
    ...getLevelProgress(stats.xp),
  };
};
