const mongoose = require('mongoose');

const actionItemSchema = new mongoose.Schema(
  {
    meetingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Meeting',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'done'],
      default: 'open',
    },
    isOverdue: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to check if item is overdue (not marked done and deadline passed)
actionItemSchema.pre('save', function () {
  const now = new Date();
  this.isOverdue = this.deadline < now && this.status !== 'done';
});

module.exports = mongoose.model('ActionItem', actionItemSchema);
