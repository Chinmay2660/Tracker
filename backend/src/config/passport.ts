import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';
import User from '../models/User';
dotenv.config();
const clientID = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
if (clientID && clientSecret && clientID !== 'your-google-client-id-here.apps.googleusercontent.com' && clientSecret !== 'YOUR_CLIENT_SECRET_HERE') {
    console.log('✅ Google OAuth initialized successfully');
    passport.use(new GoogleStrategy({
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8000/auth/google/callback',
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            console.log('🔍 Google OAuth Profile:', {
                id: profile.id,
                email: profile.emails?.[0]?.value,
                name: profile.displayName
            });
            const mongoose = require('mongoose');
            if (mongoose.connection.readyState !== 1) {
                console.log('⏳ MongoDB not ready, attempting to connect... ReadyState:', mongoose.connection.readyState);
                if (process.env.MONGODB_URI && mongoose.connection.readyState === 0) {
                    try {
                        await mongoose.connect(process.env.MONGODB_URI, {
                            serverSelectionTimeoutMS: 15000,
                            socketTimeoutMS: 45000,
                            connectTimeoutMS: 15000,
                            maxPoolSize: 10,
                            retryWrites: true,
                        });
                        console.log('✅ MongoDB connected on-demand');
                    }
                    catch (connectError: any) {
                        console.error('❌ MongoDB connection failed:', connectError.message);
                    }
                }
                let attempts = 0;
                const maxAttempts = 100;
                while (mongoose.connection.readyState !== 1 && attempts < maxAttempts) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                if (mongoose.connection.readyState !== 1) {
                    console.error('❌ MongoDB connection timeout. ReadyState:', mongoose.connection.readyState);
                    console.error('   MONGODB_URI is set:', !!process.env.MONGODB_URI);
                    return done(new Error('Database connection timeout. Please check MONGODB_URI in Vercel environment variables.'), undefined);
                }
                console.log('✅ MongoDB connected after wait');
            }
            let user = await User.findOne({ googleId: profile.id });
            if (user) {
                console.log('✅ Found existing user by googleId:', user.email);
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
        }
        catch (error: any) {
            console.error('❌ OAuth Strategy Error:', error.message);
            console.error('❌ Error Stack:', error.stack);
            return done(error as Error, undefined);
        }
    }));
}
else {
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
    }
    catch (error) {
        done(error as Error, undefined);
    }
});
