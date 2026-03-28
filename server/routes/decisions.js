const express = require('express');
const router = express.Router();
const Decision = require('../models/Decision');
const Meeting = require('../models/Meeting');
const auth = require('../middleware/auth');
const { grantXp } = require('../utils/gamification');

// Add decision to meeting
router.post('/:meetingId', auth, async (req, res) => {
  try {
    const { description } = req.body;
    const decision = new Decision({
      meetingId: req.params.meetingId,
      description
    });
    await decision.save();
    // Add to meeting
    await Meeting.findByIdAndUpdate(req.params.meetingId, { $push: { decisions: decision._id } });
    await grantXp(req.user.userId, 3);
    res.status(201).json(decision);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get decisions for a meeting
router.get('/:meetingId', auth, async (req, res) => {
  try {
    const decisions = await Decision.find({ meetingId: req.params.meetingId });
    res.json(decisions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
