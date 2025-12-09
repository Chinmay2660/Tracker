import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User';

// Ensure environment variables are loaded
dotenv.config();

// Get credentials
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Only initialize Google OAuth if credentials are provided
if (clientID && clientSecret && clientID !== 'your-google-client-id-here.apps.googleusercontent.com' && clientSecret !== 'YOUR_CLIENT_SECRET_HERE') {
  console.log('✅ Google OAuth initialized successfully');
  passport.use(
    new GoogleStrategy(
      {
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback',
      },
    async (accessToken, refreshToken, profile, done) => {
      try {
        console.log('🔍 Google OAuth Profile:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName
        });

        // Check if MongoDB is connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
          console.error('❌ MongoDB not connected. ReadyState:', mongoose.connection.readyState);
          return done(new Error('Database not connected. Please start MongoDB.'), undefined);
        }

        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          console.log('✅ Found existing user by googleId:', user.email);
          // Update avatar in case it changed
          if (profile.photos?.[0]?.value && user.avatar !== profile.photos[0].value) {
            user.avatar = profile.photos[0].value;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.findOne({ email: profile.emails?.[0]?.value });

        if (user) {
          console.log('✅ Found existing user by email, linking Google ID:', user.email);
          user.googleId = profile.id;
          // Update avatar from Google profile
          if (profile.photos?.[0]?.value) {
            user.avatar = profile.photos[0].value;
          }
          await user.save();
          return done(null, user);
        }

        console.log('📝 Creating new user:', profile.emails?.[0]?.value);
        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value || '',
          avatar: profile.photos?.[0]?.value || '',
        });

        console.log('✅ Created new user:', user.email);
        return done(null, user);
      } catch (error: any) {
        console.error('❌ OAuth Strategy Error:', error.message);
        console.error('❌ Error Stack:', error.stack);
        return done(error as Error, undefined);
      }
    }
  )
  );
} else {
  console.warn('⚠️  Google OAuth credentials not found. OAuth authentication will not work.');
  console.warn('   Please create a .env file with GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
}

passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || undefined);
  } catch (error) {
    done(error as Error, undefined);
  }
});

