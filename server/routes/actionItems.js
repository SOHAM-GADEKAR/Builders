const express = require('express');
const router = express.Router();
const ActionItem = require('../models/ActionItem');
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');
const { grantXp, updateOnTimeStreak, resetStreak } = require('../utils/gamification');

// Create action item
router.post('/:meetingId', auth, async (req, res) => {
  try {
    const { title, owner, deadline } = req.body;
    const actionItem = new ActionItem({
      meetingId: req.params.meetingId,
      title,
      owner,
      deadline
    });
    await actionItem.save();
    await actionItem.populate('owner', 'name email');
    // Add to meeting
    await Meeting.findByIdAndUpdate(req.params.meetingId, { $push: { actionItems: actionItem._id } });
    await grantXp(req.user.userId, 2);
    res.status(201).json(actionItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all action items for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const items = await ActionItem.find({ owner: req.params.userId })
      .populate('owner', 'name email')
      .sort({ deadline: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update action item status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, deadline } = req.body;

    const item = await ActionItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Action item not found' });
    }

    const previousStatus = item.status;

    if (status !== undefined) {
      item.status = status;
    }

    // Only update deadline if explicitly provided with a real value.
    if (deadline !== undefined && deadline !== null && deadline !== '') {
      item.deadline = deadline;
    }

    await item.save();
    await item.populate('owner', 'name email');

    if (previousStatus !== 'done' && item.status === 'done') {
      const isOnTime = item.deadline && new Date(item.deadline) >= new Date();
      if (isOnTime) {
        await grantXp(req.user.userId, 10);
        await updateOnTimeStreak(req.user.userId);
      } else {
        await grantXp(req.user.userId, 5);
        await resetStreak(req.user.userId);
      }
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overdue action items for a user
router.get('/overdue/:userId', auth, async (req, res) => {
  try {
    const now = new Date();
    const items = await ActionItem.find({ owner: req.params.userId, status: { $ne: 'done' }, deadline: { $lt: now } })
      .populate('owner', 'name email');
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
