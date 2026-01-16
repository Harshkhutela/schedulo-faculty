const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: true
  },
  hoursPerWeek: {
    type: Number,
    required: true
  }
});

const timeOffSchema = new mongoose.Schema({
  day: String,
  start: String,
  end: String
});

const teacherSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  shortName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    default: null,
    sparse: true,
    unique: true
  },
  workingHoursPerWeek: {
    type: Number,
    required: true
  },
  timeOff: [timeOffSchema],
  assignments: [assignmentSchema]
});

module.exports = mongoose.models.Teacher || mongoose.model('Teacher', teacherSchema);
