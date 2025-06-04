const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable'); // adjust path as needed
const Course = require('../models/Course');       // assumes a Course model for dropdown list

router.get('/', async (req, res) => {
  try {
    const selectedCourse = req.query.course || null;
    const courses = await Course.find().distinct('name'); // get course names for dropdown

    let timetableData = {};
    let subjectTeachers = {};
    let university = '';
    let faculty = '';
    let wefDate = '';

    if (selectedCourse) {
      const data = await Timetable.find({ courseName: selectedCourse });
      if (data.length > 0) {
        data.forEach(entry => {
          if (!timetableData[entry.courseName]) timetableData[entry.courseName] = {};
          if (!timetableData[entry.courseName][entry.day]) timetableData[entry.courseName][entry.day] = {};
          timetableData[entry.courseName][entry.day][entry.slotIndex] = {
            subject: entry.subject,
            teacher: entry.teacher,
            room: entry.room
          };
        });

        // Set metadata (assumes same across entries)
        const meta = data[0];
        university = meta.university;
        faculty = meta.faculty;
        wefDate = meta.effectiveFrom;
        subjectTeachers[selectedCourse] = meta.subjectTeachers || [];
      }
    } else {
      // Fetch all timetables if no filter
      const data = await Timetable.find();
      data.forEach(entry => {
        if (!timetableData[entry.courseName]) timetableData[entry.courseName] = {};
        if (!timetableData[entry.courseName][entry.day]) timetableData[entry.courseName][entry.day] = {};
        timetableData[entry.courseName][entry.day][entry.slotIndex] = {
          subject: entry.subject,
          teacher: entry.teacher,
          room: entry.room
        };
        subjectTeachers[entry.courseName] = entry.subjectTeachers || [];
      });

      // Metadata (can be generalized or pulled from one entry)
      if (data.length > 0) {
        university = data[0].university;
        faculty = data[0].faculty;
        wefDate = data[0].effectiveFrom;
      }
    }


    res.render('user/timetable', {
      timetable: timetableData,
      university,
      faculty,
      wefDate,
      subjectTeachers,
      slots: ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-1:00', '1:00-2:00', '2:00-3:00', '3:00-4:00'],
      days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      courses,
      selectedCourse
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;