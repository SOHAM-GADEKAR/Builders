require('dotenv').config();
const mongoose = require('mongoose');
const ActionItem = require('./models/ActionItem');
const Meeting = require('./models/Meeting');
const User = require('./models/User');

async function resolveFallbackUserId() {
  const demo = await User.findOne({ email: 'demo@example.com' }).select('_id');
  if (demo) return demo._id;

  const firstUser = await User.findOne().select('_id');
  return firstUser ? firstUser._id : null;
}

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const fallbackUserId = await resolveFallbackUserId();
    if (!fallbackUserId) {
      console.log('No users found in database. Nothing to fix.');
      process.exit(0);
    }

    const items = await ActionItem.find().select('_id owner meetingId title');
    let fixed = 0;
    let skipped = 0;

    for (const item of items) {
      const ownerExists = item.owner ? await User.exists({ _id: item.owner }) : false;
      if (ownerExists) {
        skipped += 1;
        continue;
      }

      let newOwnerId = fallbackUserId;
      if (item.meetingId) {
        const meeting = await Meeting.findById(item.meetingId).select('createdBy');
        if (meeting && meeting.createdBy) {
          const creatorExists = await User.exists({ _id: meeting.createdBy });
          if (creatorExists) {
            newOwnerId = meeting.createdBy;
          }
        }
      }

      await ActionItem.findByIdAndUpdate(item._id, { owner: newOwnerId });
      fixed += 1;
      console.log(`Fixed owner for action item: ${item.title} (${item._id})`);
    }

    console.log(`Done. Fixed: ${fixed}, Already valid: ${skipped}`);
    process.exit(0);
  } catch (error) {
    console.error('Failed to fix action item owners:', error.message);
    process.exit(1);
  }
}

run();
