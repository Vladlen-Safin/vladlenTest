const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const User = require('../models/User');

module.exports = function (passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        const newUser = {
            googleId: profile.id,
            displayName: profile.displayName,
            username: profile.displayName,
            firstName: profile.name.givenName,
            lastName: profile.name.familyName,
            image: profile.photos[0].value,
            email: profile.emails[0].value
          }
          
          try {
            // 1. Сначала пробуем найти по googleId
            let user = await User.findOne({ googleId: profile.id });
          
            // 2. Если не найден, пробуем найти по email
            if (!user) {
              user = await User.findOne({ email: newUser.email });
          
              if (user) {
                // Привязываем googleId к существующему пользователю
                user.googleId = newUser.googleId;
                await user.save();
              } else {
                // 3. Если вообще не найден — создаём нового
                user = await User.create(newUser);
              }
            }
          
            done(null, user);
          } catch (err) {
            console.error(err);
          }
      }
    )
  );

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id); // без callback
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
};
