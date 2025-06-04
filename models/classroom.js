// models/classroom.js
const mongoose = require('mongoose');

const classroomSchema = new mongoose.Schema({
  classOrLab: {
    type: String,
    required: true,
    enum: ['class', 'lab'],
  },
  roomNumber: {
    type: String,
    required: true,
    trim: true
  },
  building: {
    type: String,
    required: true,
    trim: true
  },
  capacityRange: {
    type: String,
    enum: ['30-45', '60-80'],
    required: function () {
      return this.classOrLab === 'class';
    }
  },
  labType: {
    type: String,
    required: function () {
      return this.classOrLab === 'lab';
    },
    default: ''
  }
});

// Avoid overwriting the model if it's already defined
const Classroom = mongoose.models.Classroom || mongoose.model('Classroom', classroomSchema);

module.exports = Classroom;
