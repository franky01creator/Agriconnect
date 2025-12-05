import 'dotenv/config';
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import jwt from "jsonwebtoken";

// Configure Google OAuth Strategy (only if credentials are available)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL || 
                    (process.env.BACKEND_URL || process.env.FRONTEND_URL || 'http://localhost:5001') + "/api/auth/google/callback"
            },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Check if user already exists with this Google ID
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    // User exists, return user
                    return done(null, user);
                }

                // Check if user exists with this email (but different auth method)
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // User exists with email but no Google ID, link the accounts
                    user.googleId = profile.id;
                    user.profilePicture = profile.photos[0]?.value || '';
                    await user.save();
                    return done(null, user);
                }

                // Create new user
                const newUser = await User.create({
                    googleId: profile.id,
                    fullName: profile.displayName || profile.name?.givenName + ' ' + profile.name?.familyName,
                    email: profile.emails[0].value,
                    profilePicture: profile.photos[0]?.value || '',
                    role: 'buyer' // Default role, can be updated later
                });

                return done(null, newUser);
            } catch (error) {
                console.error("Google OAuth Error:", error);
                return done(error, null);
            }
        }
    ));
    console.log('Google OAuth strategy configured successfully');
} else {
    console.warn('Google OAuth credentials not found. Google Sign-In will not be available.');
    console.warn('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file');
}

// Serialize user for session
passport.serializeUser((user, done) => {
    done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

export default passport;

