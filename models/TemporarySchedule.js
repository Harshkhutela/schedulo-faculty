const mongoose = require('mongoose');

const TemporaryScheduleSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  course: String,
  subject: String,

  original: {
    day: String,
    slot: Number
  },

  shiftedTo: {
    day: String,
    slot: Number,
    date: Date
  },

  room: String,

  expiresAt: Date
}, { timestamps: true });

module.exports = mongoose.model('TemporarySchedule', TemporaryScheduleSchema);
