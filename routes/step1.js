const express = require('express');
const router = express.Router();
const Config = require('../models/config');

// GET Step 1 page
router.get('/', async (req, res) => {
  try {
    const config = await Config.findOne();
    res.render('steps/step1', { config });
  } catch (error) {
    console.error('Error loading Step 1:', error);
    res.status(500).send('Server Error');
  }
});

// POST Step 1 form submission
router.post('/', async (req, res) => {
  try {
    const {
      department,
      lectureDuration,
      labDuration,
      lunchStart,
      lunchEnd
    } = req.body;

    // Save department name to session (used in step2)
    req.session.departmentName = department;

    let config = await Config.findOne();
    if (config) {
      // Update existing config
      config.department = department;
      config.lectureDuration = lectureDuration;
      config.labDuration = labDuration;
      config.lunchStart = lunchStart;
      config.lunchEnd = lunchEnd;
      await config.save();
    } else {
      // Create new config
      await Config.create({
        department,
        lectureDuration,
        labDuration,
        lunchStart,
        lunchEnd
      });
    }

    res.redirect('/step2');
  } catch (error) {
    console.error('Error saving Step 1:', error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
