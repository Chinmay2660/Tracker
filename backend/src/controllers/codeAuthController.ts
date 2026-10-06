import { Response } from 'express';
import User, { serializeUser } from '../models/User';
import { ensureDemoData } from '../lib/seedDemoData';
import {
    generateAuthCode,
    hashAuthCode,
    isValidAuthCode,
    isValidUsername,
    normalizeUsername,
    verifyAuthCode,
} from '../lib/auth';
import { AuthRequest } from '../middleware/auth';
import { buildSessionCookie, clearSessionCookie, createSessionToken, verifySessionToken } from '../lib/session';

export const loginWithCode = async (req: AuthRequest, res: Response) => {
    try {
        const username = normalizeUsername(req.body.username ?? '');
        const code = String(req.body.code ?? '').trim();
        if (!username || !code) {
            return res.status(400).json({ success: false, error: 'Username and code are required' });
        }
        const user = await User.findOne({ username }).select('+authCodeHash');
        if (!user?.authCodeHash || !verifyAuthCode(code, user.authCodeHash)) {
            return res.status(401).json({ success: false, error: 'Invalid username or code' });
        }
        res.setHeader('Set-Cookie', buildSessionCookie(String(user._id)));
        return res.json({
            success: true,
            user: serializeUser(user),
            session: createSessionToken(String(user._id)),
        });
    }
    catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Login failed' });
    }
};

export const registerWithCode = async (req: AuthRequest, res: Response) => {
    try {
        const username = normalizeUsername(req.body.username ?? '');
        const name = String(req.body.name ?? '').trim();
        const code = String(req.body.code ?? '').trim();
        if (!isValidUsername(username)) {
            return res.status(400).json({ success: false, error: 'Username must be 3-20 chars (letters, numbers, underscore)' });
        }
        if (!name) {
            return res.status(400).json({ success: false, error: 'Name is required' });
        }
        if (!isValidAuthCode(code)) {
            return res.status(400).json({ success: false, error: 'Code must be exactly 6 digits' });
        }
        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(409).json({ success: false, error: 'Username already taken' });
        }
        const user = await User.create({
            username,
            authCodeHash: hashAuthCode(code),
            name,
            onboardingComplete: true,
        });
        res.setHeader('Set-Cookie', buildSessionCookie(String(user._id)));
        return res.status(201).json({
            success: true,
            user: serializeUser(user),
            authCode: code,
            session: createSessionToken(String(user._id)),
        });
    }
    catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Registration failed' });
    }
};

export const regenerateCode = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).select('+authCodeHash');
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const authCode = generateAuthCode();
        user.authCodeHash = hashAuthCode(authCode);
        await user.save();
        return res.json({ success: true, authCode });
    }
    catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Failed to regenerate code' });
    }
};

export const exchangeSession = async (req: AuthRequest, res: Response) => {
    try {
        const session = String(req.body.session ?? req.query.session ?? '').trim();
        const userId = verifySessionToken(session);
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Invalid or expired session' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(401).json({ success: false, error: 'User not found' });
        }
        res.setHeader('Set-Cookie', buildSessionCookie(String(user._id)));
        return res.json({
            success: true,
            user: serializeUser(user),
            session: createSessionToken(String(user._id)),
        });
    }
    catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Session exchange failed' });
    }
};

export const createSsoSession = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        return res.json({ success: true, session: createSessionToken(String(req.user._id)) });
    }
    catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Failed to create SSO session' });
    }
};

export const logoutWithCookie = async (_req: AuthRequest, res: Response) => {
    res.setHeader('Set-Cookie', clearSessionCookie());
    return res.json({ success: true, message: 'Logged out successfully' });
};

export const loginAsGuest = async (_req: AuthRequest, res: Response) => {
    try {
        const user = await ensureDemoData();
        res.setHeader('Set-Cookie', buildSessionCookie(String(user._id)));
        return res.json({
            success: true,
            user: serializeUser(user),
            session: createSessionToken(String(user._id)),
        });
    }
    catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Guest login failed' });
    }
};
