const mongoose = require('mongoose');

const TimetableSchema = new mongoose.Schema({
  university: { type: String, required: true },
  faculty: { type: String, required: true },
  effectiveFrom: { type: Date, required: true },
  timetable: { type: mongoose.Schema.Types.Mixed, required: true },
  days: [{ type: String, required: true }],
  slots: [{ type: String, required: true }],
  subjectTeachers: { type: mongoose.Schema.Types.Mixed, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Timetable', TimetableSchema);
