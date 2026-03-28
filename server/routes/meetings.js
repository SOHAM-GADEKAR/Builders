const express = require('express');
const Meeting = require('../models/Meeting');
const Decision = require('../models/Decision');
const ActionItem = require('../models/ActionItem');
const authMiddleware = require('../middleware/auth');
const { grantXp } = require('../utils/gamification');
const router = express.Router();

// Create a new meeting
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, date, attendees, agenda } = req.body;

    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const normalizedAttendees = Array.isArray(attendees) && attendees.length > 0
      ? attendees
      : [req.user.userId];

    const meeting = new Meeting({
      title,
      date,
      attendees: normalizedAttendees,
      agenda: agenda || '',
      createdBy: req.user.userId,
    });

    await meeting.save();
    await meeting.populate('attendees', 'name email');
    await grantXp(req.user.userId, 5);

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all meetings (optionally filtered by attendee)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const meetings = await Meeting.find({
      $or: [
        { attendees: req.user.userId },
        { createdBy: req.user.userId },
      ],
    })
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email')
      .sort({ date: -1 });

    res.json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Weekly digest for meetings user has access to
router.get('/weekly-digest', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const day = now.getDay();
    const diffToMonday = (day + 6) % 7;

    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - diffToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const accessibleMeetings = await Meeting.find({
      $or: [
        { attendees: req.user.userId },
        { createdBy: req.user.userId },
      ],
    }).select('_id');

    const meetingIds = accessibleMeetings.map((m) => m._id);

    const decisions = await Decision.find({
      meetingId: { $in: meetingIds },
      createdAt: { $gte: weekStart, $lt: weekEnd },
    }).sort({ createdAt: -1 });

    const itemsDueThisWeek = await ActionItem.find({
      meetingId: { $in: meetingIds },
      deadline: { $gte: weekStart, $lt: weekEnd },
    })
      .populate('owner', 'name email')
      .sort({ deadline: 1 });

    const overdueItems = await ActionItem.find({
      meetingId: { $in: meetingIds },
      status: { $ne: 'done' },
      deadline: { $lt: now },
    })
      .populate('owner', 'name email')
      .sort({ deadline: 1 });

    const completedItems = await ActionItem.find({
      meetingId: { $in: meetingIds },
      status: 'done',
      updatedAt: { $gte: weekStart, $lt: weekEnd },
    })
      .populate('owner', 'name email')
      .sort({ updatedAt: -1 });

    res.json({
      weekStart,
      weekEnd,
      decisionsCount: decisions.length,
      itemsDueCount: itemsDueThisWeek.length,
      overdueCount: overdueItems.length,
      completedCount: completedItems.length,
      decisions,
      itemsDueThisWeek,
      overdueItems,
      completedItems,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a specific meeting with decisions and action items
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id)
      .populate('attendees', 'name email')
      .populate('createdBy', 'name email')
      .populate({
        path: 'decisions',
        select: 'description createdAt',
      })
      .populate({
        path: 'actionItems',
        select: 'title owner deadline status isOverdue',
        populate: {
          path: 'owner',
          select: 'name email',
        },
      });

    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a meeting
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { title, date, attendees, agenda } = req.body;

    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only update meetings you created' });
    }

    if (title) meeting.title = title;
    if (date) meeting.date = date;
    if (attendees) meeting.attendees = attendees;
    if (agenda) meeting.agenda = agenda;

    await meeting.save();
    await meeting.populate('attendees', 'name email');

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a meeting
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    if (meeting.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You can only delete meetings you created' });
    }

    // Delete associated decisions and action items
    await Decision.deleteMany({ meetingId: req.params.id });
    await ActionItem.deleteMany({ meetingId: req.params.id });

    await Meeting.findByIdAndDelete(req.params.id);

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
