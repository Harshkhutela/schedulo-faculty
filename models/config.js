const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
  department: String,
  lectureDuration: Number, // in minutes
  labDuration: Number,     // in minutes
  lunchStart: String,      // e.g., "12:30"
  lunchEnd: String         // e.g., "13:30"
});

module.exports = mongoose.model('Config', configSchema);
