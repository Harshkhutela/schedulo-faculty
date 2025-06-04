const express = require('express');
const passport = require('passport');
const router = express.Router();

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
  (req, res) => {
    if (req.user.isAdmin) {
      res.redirect('/step1'); // Admin goes to timetable setup
    } else if (req.user.email.endsWith('@svsu.ac.in')) {
      res.redirect('/user/timetable'); // Normal user from svsu domain
    } else {
      req.logout(() => {
        res.send('Access Denied: Only @svsu.ac.in users allowed.');
      });
    }
  }
);

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/auth/login');
  });
});

module.exports = router;