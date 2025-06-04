const express = require('express');
const router = express.Router();
const Subject = require('../models/Subject');

// Step 2: Get all subjects
router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find();
    const departmentName = req.session.departmentName || '';
    res.render('steps/step2', { subjects, departmentName });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error retrieving subjects");
  }
});

// Add subject
router.post('/add', async (req, res) => {
  try {
    const { fullName, shortName, count, hoursPerLecture, isLab, labType } = req.body;
    const department = req.session.departmentName || 'General';

    const newSubject = new Subject({
      fullName,
      shortName,
      count,
      hoursPerLecture,
      isLab: isLab ? true : false,
      groupSystem: isLab ? true : false,
      labType: isLab ? labType : '',
      department,
    });

    await newSubject.save();
    res.redirect('/step2');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error adding subject");
  }
});

// Edit subject
router.post('/edit/:id', async (req, res) => {
  try {
    const { fullName, shortName, count, hoursPerLecture, isLab, labType } = req.body;
    const subject = await Subject.findById(req.params.id);

    if (!subject) {
      return res.status(404).send("Subject not found");
    }

    subject.fullName = fullName;
    subject.shortName = shortName;
    subject.count = count;
    subject.hoursPerLecture = hoursPerLecture;
    subject.isLab = isLab ? true : false;
    subject.groupSystem = isLab ? true : false;
    subject.labType = isLab ? labType : '';

    await subject.save();
    res.redirect('/step2');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error updating subject");
  }
});

// Delete subject
router.post('/delete/:id', async (req, res) => {
  try {
    await Subject.findByIdAndDelete(req.params.id);
    res.redirect('/step2');
  } catch (error) {
    console.error(error);
    res.status(500).send("Error deleting subject");
  }
});

// Navigation
router.post('/save', (req, res) => res.redirect('/step2'));
router.post('/next', (req, res) => res.redirect('/step3'));

module.exports = router;
