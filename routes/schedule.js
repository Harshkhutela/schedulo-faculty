const express = require('express');
const router = express.Router();

const Timetable = require('../models/Timetable');
const TemporarySchedule = require('../models/TemporarySchedule');
const ScheduleNotification = require('../models/ScheduleNotification');
const Classroom = require('../models/classroom');

// Helper: Get week start date (Monday)
function getWeekStartDate(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
}

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
        const roomStr = courseData[day][slot].room;
        if (roomStr) {
          // Store as "roomNumber|building" format for unique identification
          busyRooms.add(roomStr);
        }
      }
    });

    // 2️⃣ TEMPORARY SCHEDULE CHECK (DATE RANGE)
    const tempSchedules = await TemporarySchedule.find({
      'to.day': day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay }
    });

    tempSchedules.forEach(s => {
      // Store as "roomNumber, building" format
      busyRooms.add(s.room);
    });

    // 3️⃣ ALL ROOMS WITH DETAILS
    const allRooms = await Classroom.find();
    
    console.log('Total rooms in database:', allRooms.length);
    console.log('Busy rooms set (roomNumber, building):', [...busyRooms]);
    
    const freeRooms = allRooms
      .filter(r => {
        // Create the full identifier: "roomNumber, building"
        const fullIdentifier = `${r.roomNumber}, ${r.building}`;
        const isBusy = busyRooms.has(fullIdentifier);
        console.log(`Room ${fullIdentifier}: ${isBusy ? 'BUSY' : 'FREE'}`);
        return !isBusy;
      })
      .map(r => ({
        roomNumber: r.roomNumber,
        building: r.building,
        classOrLab: r.classOrLab,
        labType: r.labType || ''
      }));

    console.log('Free rooms returned:', freeRooms.length);
    console.log('Free rooms details:', freeRooms);

    res.json({ rooms: freeRooms });

  } catch (err) {
    console.error('Free rooms error:', err);
    res.status(500).json({ rooms: [] });
  }
});


/**
 * 🔹 SAVE TEMPORARY SCHEDULE (RESCHEDULE CLASS)
 * - Moves class from original slot to new slot on specific date
 * - Freezes date for other teachers
 * - Creates notification
 */
router.post('/api/save-temporary-schedule', async (req, res) => {
  try {
    const data = req.body;
    console.log('📌 Saving temporary schedule:', JSON.stringify(data, null, 2));

    if (!data.teacherId || !data.course || !data.from || !data.to || !data.room || !data.building) {
      console.error('❌ Missing required fields:', { 
        teacherId: !!data.teacherId, 
        course: !!data.course, 
        from: !!data.from, 
        to: !!data.to, 
        room: !!data.room,
        building: !!data.building
      });
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const slot = Number(data.to.slot);

    const dateObj = new Date(data.to.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // ❌ CHECK: SLOT ALREADY USED BY ANY TEACHER (FROZEN)?
    // This prevents ANY teacher from booking a slot that's already been rescheduled to
    const slotClash = await TemporarySchedule.findOne({
      'to.day': data.to.day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay },
      status: 'scheduled'
    });

    if (slotClash) {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(slotClash.teacherId);
      console.warn('⚠️ Slot clash detected:', slotClash);
      return res.status(409).json({
        error: `❌ This slot is already scheduled by ${teacher?.name || 'another teacher'}. This slot is frozen.`
      });
    }

    // ❌ CHECK: ROOM ALREADY USED?
    const roomClash = await TemporarySchedule.findOne({
      room: data.room,
      'to.day': data.to.day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay },
      status: 'scheduled'
    });

    if (roomClash) {
      console.warn('⚠️ Room clash detected:', roomClash);
      return res.status(409).json({
        error: `This room is already booked on ${data.to.date} at this slot`
      });
    }

    // Get week start date
    const weekStart = getWeekStartDate(dateObj);
    console.log('📅 Week start date:', weekStart);

    // ✅ SAVE TEMPORARY SCHEDULE
    const tempSchedule = await TemporarySchedule.create({
      course: data.course,
      subject: data.subject || '',
      teacherId: data.teacherId,
      from: data.from,
      to: {
        day: data.to.day,
        slot,
        date: dateObj
      },
      room: data.room,
      building: data.building,
      weekStartDate: weekStart,
      status: 'scheduled'
    });

    console.log('✅ Temporary schedule saved:', tempSchedule._id);

    // ✅ CREATE NOTIFICATION
    const notification = await ScheduleNotification.create({
      course: data.course,
      subject: data.subject || '',
      teacherId: data.teacherId,
      fromSlot: data.from,
      toSlot: {
        day: data.to.day,
        slot,
        date: dateObj
      },
      room: data.room,
      building: data.building,
      scheduledDate: dateObj
    });

    console.log('✅ Notification created:', notification._id);

    res.json({ 
      success: true, 
      message: 'Class scheduled successfully!',
      schedule: tempSchedule 
    });

  } catch (err) {
    console.error('❌ Error saving schedule:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: 'Failed to save schedule: ' + err.message });
  }
});

// 🔹 GET ALL SCHEDULED NOTIFICATIONS FOR USER
router.get('/api/scheduled-notifications', async (req, res) => {
  try {
    const notifications = await ScheduleNotification.find()
      .populate('teacherId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ notifications });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    res.status(500).json({ notifications: [] });
  }
});

// 🔹 GET TEMPORARY SCHEDULES FOR SPECIFIC WEEK (STUDENT VIEW)
router.get('/api/week-schedules', async (req, res) => {
  try {
    const { weekStartDate } = req.query;
    const weekStart = new Date(weekStartDate);
    weekStart.setHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    weekEnd.setHours(23, 59, 59, 999);

    const schedules = await TemporarySchedule.find({
      weekStartDate: weekStart,
      status: 'scheduled',
      'to.date': { $gte: weekStart, $lte: weekEnd }
    });

    res.json({ schedules });
  } catch (err) {
    console.error('Error fetching week schedules:', err);
    res.status(500).json({ schedules: [] });
  }
});

// 🔹 GET SCHEDULED CLASSES FOR TODAY
router.get('/api/today-schedules', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaySchedules = await TemporarySchedule.find({
      'to.date': { $gte: today, $lt: tomorrow },
      status: 'scheduled'
    });

    res.json({ schedules: todaySchedules });
  } catch (err) {
    console.error('Error fetching today schedules:', err);
    res.status(500).json({ schedules: [] });
  }
});

/**
 * 🔹 UNDO RESCHEDULE - Delete temporary schedule and related notification
 * - Removes the temporary schedule
 * - Deletes the notification
 * - Class goes back to original slot
 */
router.delete('/api/undo-schedule/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;

    console.log('🔄 Undoing schedule:', scheduleId);

    // Find the schedule to get details for notification deletion
    const schedule = await TemporarySchedule.findById(scheduleId);
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Delete the temporary schedule
    await TemporarySchedule.findByIdAndDelete(scheduleId);
    console.log('✅ Temporary schedule deleted');

    // Delete related notification
    await ScheduleNotification.deleteOne({
      teacherId: schedule.teacherId,
      course: schedule.course,
      'toSlot.date': schedule.to.date
    });
    console.log('✅ Notification deleted');

    res.json({ 
      success: true, 
      message: 'Schedule undone! Class moved back to original slot.'
    });

  } catch (err) {
    console.error('❌ Error undoing schedule:', err.message);
    res.status(500).json({ error: 'Failed to undo schedule: ' + err.message });
  }
});

/**
 * 🔹 RESCHEDULE - Update existing schedule to new slot/date/room
 * - Updates the temporary schedule with new details
 * - Updates notification
 */
router.post('/api/reschedule/:scheduleId', async (req, res) => {
  try {
    const { scheduleId } = req.params;
    const data = req.body;

    console.log('📝 Rescheduling:', scheduleId, JSON.stringify(data, null, 2));

    // Find old schedule
    const oldSchedule = await TemporarySchedule.findById(scheduleId);
    if (!oldSchedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    // Validate new data
    if (!data.to || !data.room || !data.building) {
      return res.status(400).json({ error: 'Missing required fields for reschedule' });
    }

    const slot = Number(data.to.slot);
    const dateObj = new Date(data.to.date);
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    // ❌ CHECK: NEW SLOT ALREADY USED BY ANY TEACHER (FROZEN)?
    const slotClash = await TemporarySchedule.findOne({
      _id: { $ne: scheduleId }, // Exclude current schedule
      'to.day': data.to.day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay },
      status: 'scheduled'
    });

    if (slotClash) {
      const Teacher = require('../models/Teacher');
      const teacher = await Teacher.findById(slotClash.teacherId);
      return res.status(409).json({
        error: `❌ This slot is already scheduled by ${teacher?.name || 'another teacher'}.`
      });
    }

    // ❌ CHECK: NEW ROOM ALREADY USED?
    const roomClash = await TemporarySchedule.findOne({
      _id: { $ne: scheduleId },
      room: data.room,
      'to.day': data.to.day,
      'to.slot': slot,
      'to.date': { $gte: startOfDay, $lte: endOfDay },
      status: 'scheduled'
    });

    if (roomClash) {
      return res.status(409).json({
        error: `❌ This room is already booked on ${data.to.date} at this slot`
      });
    }

    // Get week start date
    const weekStart = getWeekStartDate(dateObj);

    // ✅ UPDATE TEMPORARY SCHEDULE
    const updatedSchedule = await TemporarySchedule.findByIdAndUpdate(
      scheduleId,
      {
        to: {
          day: data.to.day,
          slot,
          date: dateObj
        },
        room: data.room,
        building: data.building,
        weekStartDate: weekStart,
        status: 'scheduled'
      },
      { new: true }
    );

    console.log('✅ Schedule updated:', updatedSchedule._id);

    // ✅ UPDATE NOTIFICATION
    await ScheduleNotification.updateOne(
      {
        teacherId: oldSchedule.teacherId,
        course: oldSchedule.course,
        'toSlot.date': oldSchedule.to.date
      },
      {
        toSlot: {
          day: data.to.day,
          slot,
          date: dateObj
        },
        room: data.room,
        building: data.building,
        scheduledDate: dateObj
      }
    );

    console.log('✅ Notification updated');

    res.json({ 
      success: true, 
      message: 'Class rescheduled successfully!',
      schedule: updatedSchedule 
    });

  } catch (err) {
    console.error('❌ Error rescheduling:', err.message);
    res.status(500).json({ error: 'Failed to reschedule: ' + err.message });
  }
});

module.exports = router;
