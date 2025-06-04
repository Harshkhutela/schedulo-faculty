const express = require('express');
const router = express.Router();
const Teacher = require('../models/Teacher');
const Course = require('../models/Course');
const Subject = require('../models/Subject');

// GET: Teacher list with courses and subjects
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find()
      .populate('assignments.course')
      .populate('assignments.subject');
    const courses = await Course.find();
    const subjects = await Subject.find();
    res.render('steps/step5', { teachers, courses, subjects });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading teachers");
  }
});

// POST: Add a new teacher with time off
router.post('/add', async (req, res) => {
  try {
    const { name, shortName, workingHoursPerWeek, timeOffDay, timeOffStart, timeOffEnd } = req.body;
    const timeOff = timeOffDay.map((day, idx) => ({
      day,
      start: timeOffStart[idx],
      end: timeOffEnd[idx]
    }));

    await Teacher.create({
      name,
      shortName,
      workingHoursPerWeek,
      timeOff,
      assignments: []
    });
    res.redirect('/step5');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error adding teacher");
  }
});

// POST: Edit teacher info
router.post('/edit/:id', async (req, res) => {
  try {
    const { name, shortName, workingHoursPerWeek, timeOffDay, timeOffStart, timeOffEnd } = req.body;
    const timeOff = timeOffDay.map((day, idx) => ({
      day,
      start: timeOffStart[idx],
      end: timeOffEnd[idx]
    }));

    await Teacher.findByIdAndUpdate(req.params.id, {
      name,
      shortName,
      workingHoursPerWeek,
      timeOff
    });
    res.redirect('/step5');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating teacher");
  }
});

// POST: Assign course/subject to teacher
router.post('/assign/:id', async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    const { course, subject } = req.body;

    const subjectDoc = await Subject.findById(subject);
    if (!subjectDoc) {
      return res.status(400).send("Subject not found");
    }

    // Prevent duplicate assignment
    const exists = teacher.assignments.some(a =>
      a.course.toString() === course && a.subject.toString() === subject
    );

    if (!exists) {
      teacher.assignments.push({
        course,
        subject,
        hoursPerWeek: subjectDoc.count * subjectDoc.hoursPerLecture
      });
      await teacher.save();
    }

    // Update assignedTeacher field in Subject
    subjectDoc.assignedTeacher = teacher._id;
    await subjectDoc.save();

    res.redirect('/step5');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error assigning subject to teacher");
  }
});

// GET: Get subjects by course ID
router.get('/getSubjectsByCourse/:courseId', async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).populate('subjects');
    res.json(course.subjects);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching subjects");
  }
});

// POST: Delete teacher
router.post('/delete/:id', async (req, res) => {
  try {
    await Teacher.findByIdAndDelete(req.params.id);
    res.redirect('/step5');
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting teacher");
  }
});

// Navigation
router.post('/save', (req, res) => res.redirect('/step5'));
router.post('/next', (req, res) => res.redirect('/step6'));

module.exports = router;
