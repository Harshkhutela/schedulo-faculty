const express = require('express');
const passport = require('passport');
const router = express.Router();
const Teacher = require('../models/Teacher');

// Login Page
router.get('/login', (req, res) => {
  res.render('login'); // You should have views/auth/login.ejs
});

// Google OAuth Login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', {
    failureRedirect: '/auth/login',
    failureMessage: true
  }),
  async (req, res) => {
    if (req.user.isAdmin) {
      return res.redirect('/step1');  // Admin panel
    }
    
    // ✅ Faculty with teacher assigned
    if (req.user.isFaculty && req.user.teacherId) {
      return res.redirect('/faculty');
    }
    
    // ✅ Faculty without teacher assigned (first login)
    if (req.user.isFaculty && !req.user.teacherId) {
      return res.redirect('/auth/faculty-setup');
    }
    
    return res.redirect('/user/timetable'); // Normal user
  }
);

// 🆕 Faculty Setup Page (First Time Login)
router.get('/faculty-setup', (req, res) => {
  if (!req.isAuthenticated() || !req.user.isFaculty) {
    return res.redirect('/auth/login');
  }
  
  if (req.user.teacherId) {
    return res.redirect('/faculty');
  }
  
  res.render('auth/faculty-setup', { userEmail: req.user.email });
});

// 🆕 API: Fetch teachers without email assignment
router.get('/api/unassigned-teachers', async (req, res) => {
  try {
    const teachersWithoutEmail = await Teacher.find({ email: null });
    res.json(teachersWithoutEmail);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error fetching teachers' });
  }
});

// 🆕 API: Assign teacher to faculty user
router.post('/api/assign-teacher', async (req, res) => {
  try {
    if (!req.isAuthenticated() || !req.user.isFaculty) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { teacherId } = req.body;
    
    // Verify teacher exists
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Update teacher email
    teacher.email = req.user.email;
    await teacher.save();

    // Update user's teacherId
    req.user.teacherId = teacher._id;
    await req.user.save();

    res.json({ success: true, message: 'Teacher assigned successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error assigning teacher' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;