const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');

/**
 * Configures the Google OAuth 2.0 strategy for Passport.js.
 *
 * If GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET are not set,
 * the strategy is silently skipped so the server can still
 * start for local development without Google OAuth.
 *
 * Verify callback flow:
 *   1. Look up a user by `googleId`.
 *   2. If found → return that user (returning login).
 *   3. If not found → check if the email already exists (account merge).
 *      - If an email match exists, link the googleId to that account.
 *   4. Otherwise, create a brand-new user with the Google profile data
 *      and no local password.
 */
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(null, false, { message: 'No email associated with this Google account' });
          }

          // 1. Check if a user with this googleId already exists
          let user = await User.findOne({ googleId: profile.id });
          if (user) {
            return done(null, user);
          }

          // 2. Check if an account with the same email exists (merge)
          user = await User.findOne({ email });
          if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // 3. Create a brand-new user — no local password
          user = await User.create({
            name: profile.displayName || `${profile.name?.givenName ?? ''} ${profile.name?.familyName ?? ''}`.trim(),
            email,
            googleId: profile.id,
            password: null,
          });

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      }
    )
  );
} else {
  console.warn('⚠️  GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set — Google OAuth disabled');
}

module.exports = passport;
