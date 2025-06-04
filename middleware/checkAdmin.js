module.exports = function checkAdmin(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/login');
  }

  if (!req.user || req.user.email !== process.env.ADMIN_EMAIL) {
    return res.status(403).send('Access Denied: Admins only');
  }

  next();
};