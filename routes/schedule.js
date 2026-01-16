const express = require('express');
const router = express.Router();
const TemporarySchedule = require('../models/TemporarySchedule');
const Timetable = require('../models/Timetable');
const Classroom = require('../models/Classroom');


// 🔹 Get free rooms
router.get('/api/free-rooms', async (req, res) => {
  const { day, slot, date } = req.query;

  const allRooms = await Classroom.find();
  const tempBusy = await TemporarySchedule.find({
    'shiftedTo.day': day,
    'shiftedTo.slot': slot,
    'shiftedTo.date': new Date(date)
  });

  const busyRooms = tempBusy.map(t => t.room);

  const freeRooms = allRooms
    .map(r => r.roomNumber)
    .filter(r => !busyRooms.includes(r));

  if (!freeRooms.length) {
    return res.json({ success: false, message: 'No room available' });
  }

  res.json({ success: true, freeRooms });
});


// 🔹 Save temporary schedule
router.post('/api/temporary-schedule', async (req, res) => {
  const data = req.body;

  const classDate = new Date(data.to.date);
  const expiresAt = new Date(classDate);
  expiresAt.setHours(23, 59, 59);

  await TemporarySchedule.create({
    teacherId: data.teacherId,
    course: data.course,
    subject: data.subject,

    original: data.from,
    shiftedTo: data.to,

    room: data.room,
    expiresAt
  });

  res.json({ success: true });
});

module.exports = router;
