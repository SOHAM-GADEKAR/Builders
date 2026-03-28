const User = require('../models/User');

const BADGES = [
  { threshold: 50, name: 'Starter' },
  { threshold: 150, name: 'Momentum Builder' },
  { threshold: 300, name: 'Execution Expert' },
  { threshold: 500, name: 'Accountability Champion' },
];

const levelFromXp = (xp) => Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;

const grantXp = async (userId, amount) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.xp = Math.max(0, (user.xp || 0) + amount);
  user.level = levelFromXp(user.xp);

  const unlockedBadges = BADGES
    .filter((badge) => user.xp >= badge.threshold)
    .map((badge) => badge.name);

  const currentBadges = new Set(user.badges || []);
  unlockedBadges.forEach((badge) => currentBadges.add(badge));
  user.badges = Array.from(currentBadges);

  await user.save();
  return user;
};

const updateOnTimeStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 1;
  if (user.lastOnTimeCompletionDate) {
    const last = new Date(user.lastOnTimeCompletionDate);
    last.setHours(0, 0, 0, 0);
    const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      streak = user.currentStreak || 1;
    } else if (diffDays === 1) {
      streak = (user.currentStreak || 0) + 1;
    }
  }

  user.currentStreak = streak;
  user.longestStreak = Math.max(user.longestStreak || 0, streak);
  user.lastOnTimeCompletionDate = today;

  await user.save();
  return user;
};

const resetStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) return null;
  user.currentStreak = 0;
  await user.save();
  return user;
};

module.exports = {
  grantXp,
  updateOnTimeStreak,
  resetStreak,
  levelFromXp,
};
