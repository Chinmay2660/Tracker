import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { generateToken } from '../services/authService';
import passport from 'passport';

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleCallback = (req: any, res: Response) => {
  passport.authenticate('google', { session: false }, (err: any, user: any) => {
    if (err) {
      console.error('❌ OAuth Error:', err);
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=${encodeURIComponent(err.message || 'Authentication failed')}`);
    }

    if (!user) {
      console.error('❌ OAuth Error: No user returned from Google');
      return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=No user data received`);
    }

    try {
      console.log('✅ OAuth Success - User:', user.email);
      const token = generateToken(user._id.toString());
      res.redirect(`${process.env.FRONTEND_URL}/auth/callback?token=${token}`);
    } catch (error: any) {
      console.error('❌ Token generation error:', error);
      res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed&message=Token generation failed`);
    }
  })(req, res);
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

