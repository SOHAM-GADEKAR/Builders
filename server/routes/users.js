const express = require('express');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Get all users for task assignment
router.get('/', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'name email').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get current user's gamification profile
router.get('/me/gamification', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      'name email xp level currentStreak longestStreak badges'
    );
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Weekly leaderboard (simple XP leaderboard for now)
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, 'name email xp level currentStreak badges')
      .sort({ xp: -1, currentStreak: -1 })
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
