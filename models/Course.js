// models/course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true, trim: true },
  courseShortName: { type: String, required: true, trim: true },
  department: { type: String, trim: true },
  lunchBreakStart: { type: String, trim: true },
  lunchBreakEnd: { type: String, trim: true },
  subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true }],
  classroom: { type: mongoose.Schema.Types.ObjectId, ref: 'Classroom' },
  courseType: { type: String, enum: ['Lecture', 'Lab'], default: 'Lecture' },
  isActive: { type: Boolean, default: true },
  studentStrength: { type: Number, default: 0, min: 0 }
});

module.exports = mongoose.models.Course || mongoose.model('Course', courseSchema);

