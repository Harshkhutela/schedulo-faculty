// models/subject.js
const mongoose = require('mongoose');

// Define the schema for the Subject model
const subjectSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  shortName: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    required: true,
    min: [1, 'At least one class per week is required']
  },
  hoursPerLecture: {
    type: Number,
    required: true,
    min: [1, 'Lecture duration must be at least 1 hour']
  },
  isLab: {
    type: Boolean,
    required: true,
    default: false
  },
  groupSystem: {
    type: Boolean,
    required: true,
    default: false
  },
  labType: {
    type: String,
    trim: true,
    required: function () {
      return this.isLab;
    } // Only required if it's a lab
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  labRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Classroom',
    default: null
  },
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' } 
});
module.exports = mongoose.models.Subject || mongoose.model('Subject', subjectSchema);