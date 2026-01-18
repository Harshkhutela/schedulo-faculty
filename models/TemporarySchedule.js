const mongoose = require('mongoose');

const TemporaryScheduleSchema = new mongoose.Schema({
  course: { type: String, required: true },
  subject: { type: String, required: true },

  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },

  from: {
    day: String,
    slot: Number
  },

  to: {
    day: String,
    slot: Number,
    date: Date
  },

  room: { type: String, required: true },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('TemporarySchedule', TemporaryScheduleSchema);
