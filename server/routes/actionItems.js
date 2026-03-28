const express = require('express');
const router = express.Router();
const ActionItem = require('../models/ActionItem');
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');

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
    // Add to meeting
    await Meeting.findByIdAndUpdate(req.params.meetingId, { $push: { actionItems: actionItem._id } });
    res.status(201).json(actionItem);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all action items for a user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const items = await ActionItem.find({ owner: req.params.userId }).sort({ deadline: 1 });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update action item status
router.put('/:id', auth, async (req, res) => {
  try {
    const { status, deadline } = req.body;
    const item = await ActionItem.findByIdAndUpdate(
      req.params.id,
      { status, deadline },
      { new: true }
    );
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get overdue action items for a user
router.get('/overdue/:userId', auth, async (req, res) => {
  try {
    const now = new Date();
    const items = await ActionItem.find({ owner: req.params.userId, status: { $ne: 'done' }, deadline: { $lt: now } });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
