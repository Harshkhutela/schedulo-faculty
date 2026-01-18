const express = require('express');
const router = express.Router();

const Timetable = require('../models/Timetable');
const TemporarySchedule = require('../models/TemporarySchedule');
const Classroom = require('../models/classroom');

/**
 * 🔹 GET FREE ROOMS
 * checks:
 * 1) main timetable
 * 2) temporary schedules (same date + slot)
 */
router.get('/api/free-rooms', async (req, res) => {
  try {
    let { day, slot, date } = req.query;
    slot = Number(slot);

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const latest = await Timetable.findOne().sort({ createdAt: -1 });
    if (!latest) return res.json({ rooms: [] });

    const busyRooms = new Set();

    // 1️⃣ MAIN TIMETABLE CHECK
    Object.values(latest.timetable).forEach(courseData => {
      if (courseData[day] && courseData[day][slot]) {
        const room = courseData[day][slot].room;
        if (room) busyRooms.add(room);
      }
    });

    // 2️⃣ TEMPORARY SCHEDULE CHECK (DATE RANGE)
    const tempSchedules = await TemporarySchedule.find({
      'to.day': day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay }
    });

    tempSchedules.forEach(s => busyRooms.add(s.room));

    // 3️⃣ ALL ROOMS
    const allRooms = await Classroom.find();
    const freeRooms = allRooms
      .map(r => r.roomNumber)
      .filter(r => !busyRooms.has(r));

    console.log('Busy rooms:', [...busyRooms]);
    console.log('Free rooms:', freeRooms);

    res.json({ rooms: freeRooms });

  } catch (err) {
    console.error('Free rooms error:', err);
    res.status(500).json({ rooms: [] });
  }
});


/**
 * 🔹 SAVE TEMPORARY SCHEDULE
 * blocks:
 * - same date + slot
 * - same room clash
 */
router.post('/api/save-temporary-schedule', async (req, res) => {
  try {
    const data = req.body;

    // 🔹 normalize slot & date
    const slot = Number(data.to.slot);

    const dateObj = new Date(data.to.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // ❌ SLOT ALREADY USED?
    const slotClash = await TemporarySchedule.findOne({
      'to.day': data.to.day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay }
    });

    if (slotClash) {
      return res.status(409).json({
        error: 'This slot is already scheduled for selected date'
      });
    }

    // ❌ ROOM ALREADY USED?
    const roomClash = await TemporarySchedule.findOne({
      room: data.room,
      'to.day': data.to.day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay }
    });

    if (roomClash) {
      return res.status(409).json({
        error: 'This room is already booked for selected date'
      });
    }

    // ✅ SAVE TEMPORARY SCHEDULE
    await TemporarySchedule.create({
      ...data,
      to: {
        ...data.to,
        slot
      }
    });

    res.json({ success: true });

  } catch (err) {
    console.error('Save schedule error:', err);
    res.status(500).json({ error: 'Failed to save schedule' });
  }
});

module.exports = router;
