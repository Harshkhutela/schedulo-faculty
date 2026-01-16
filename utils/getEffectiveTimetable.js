const TemporarySchedule = require('../models/TemporarySchedule');

module.exports = async function applyTemporary(timetable, teacherId, date) {
  const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

  const temp = await TemporarySchedule.find({
    teacherId,
    'shiftedTo.date': date
  });

  temp.forEach(t => {
    delete timetable[t.course][t.original.day][t.original.slot];

    timetable[t.course][dayName][t.shiftedTo.slot] = {
      subject: t.subject,
      room: t.room,
      scheduled: true
    };
  });

  return timetable;
};
