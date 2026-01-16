const dotenv = require('dotenv');
dotenv.config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('./models/User');
const Teacher = require('./models/Teacher');

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const email = profile.emails[0].value;

      // ✅ Multiple admins check
      const adminEmails = process.env.ADMIN_EMAILS
        ? process.env.ADMIN_EMAILS.split(",").map(e => e.trim().toLowerCase())
        : [];

      const isAdmin = adminEmails.includes(email.toLowerCase());
      
      // ✅ Check if faculty email (@svsu.ac.in)
      const isFacultyEmail = /@svsu\.ac\.in$/i.test(email);

      // 🔓 Allow ANY email as user
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        const userData = {
          googleId: profile.id,
          displayName: profile.displayName || "No Name",
          email: email,
          isAdmin: isAdmin,
          isFaculty: isFacultyEmail,
          teacherId: null
        };

        // If faculty email, try to find matching teacher
        if (isFacultyEmail) {
          const teacher = await Teacher.findOne({ email: email });
          if (teacher) {
            userData.teacherId = teacher._id;
          }
        }

        user = await User.create(userData);
      } else {
        // Update flags
        user.isAdmin = isAdmin;
        user.isFaculty = isFacultyEmail;
        
        // Update teacherId if faculty
        if (isFacultyEmail) {
          const teacher = await Teacher.findOne({ email: email });
          user.teacherId = teacher ? teacher._id : null;
        }
        
        await user.save();
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});