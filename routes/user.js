// routes/user.js
const express = require('express');
const router = express.Router();
const Timetable = require('../models/Timetable');

// Middleware to ensure user is authenticated
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/auth/login');
}

// Show latest saved timetable for users
router.get('/timetable', ensureAuthenticated, async (req, res) => {
  try {
    const selectedCourse = req.query.course || null;
    const latestTimetableDoc = await Timetable.findOne().sort({ createdAt: -1 });

    if (!latestTimetableDoc) {
      return res.render('user/timetable', { timetable: null, courses: [], selectedCourse: null });
    }

    const fullTimetable = latestTimetableDoc.timetable;
    const subjectTeachers = latestTimetableDoc.subjectTeachers;
    const university = latestTimetableDoc.university;
    const faculty = latestTimetableDoc.faculty;
    const wefDate = latestTimetableDoc.effectiveFrom;
    const days = latestTimetableDoc.days;
    const slots = latestTimetableDoc.slots;

    const courses = Object.keys(fullTimetable);

    let filteredTimetable = fullTimetable;
    let filteredSubjectTeachers = subjectTeachers;

    if (selectedCourse && fullTimetable[selectedCourse]) {
      filteredTimetable = {
        [selectedCourse]: fullTimetable[selectedCourse]
      };
      filteredSubjectTeachers = {
        [selectedCourse]: subjectTeachers[selectedCourse] || []
      };
    }

    res.render('user/timetable', {
      timetable: filteredTimetable,
      university,
      faculty,
      wefDate,
      subjectTeachers: filteredSubjectTeachers,
      slots,
      days,
      courses,
      selectedCourse
    });
  } catch (err) {
    console.error('Error fetching timetable for user:', err);
    res.status(500).send('Error loading timetable');
  }
});

module.exports = router;