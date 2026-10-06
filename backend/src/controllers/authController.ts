import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { serializeUser } from '../models/User';
import { buildSessionCookie, clearSessionCookie, createSessionToken, parseCookies } from '../lib/session';
import passport from 'passport';

const OAUTH_RETURN_COOKIE = 'oauth-return-to';

function safeReturnTo(raw: unknown): string | null {
    if (typeof raw !== 'string' || !raw.trim())
        return null;
    try {
        const url = new URL(raw);
        const allowed = [
            process.env.FRONTEND_URL,
            process.env.GROWTHHUB_URL,
            process.env.SWITCH_PREP_URL,
            ...(process.env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()),
        ].filter(Boolean) as string[];
        if (allowed.some((origin) => url.origin === new URL(origin).origin)) {
            return url.toString();
        }
    }
    catch {
        return null;
    }
    return null;
}

export const googleAuth = (req: AuthRequest, res: Response, next: () => void) => {
    const returnTo = safeReturnTo(req.query.returnTo);
    if (returnTo) {
        res.setHeader('Set-Cookie', `${OAUTH_RETURN_COOKIE}=${encodeURIComponent(returnTo)}; Path=/; Max-Age=600; HttpOnly; SameSite=Lax`);
    }
    passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

export const googleCallback = (req: AuthRequest, res: Response) => {
    passport.authenticate('google', { session: false }, (err: any, user: any) => {
        const cookies = parseCookies(req.headers.cookie);
        const returnTo = safeReturnTo(decodeURIComponent(cookies[OAUTH_RETURN_COOKIE] || ''));
        res.setHeader('Set-Cookie', `${OAUTH_RETURN_COOKIE}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax`);

        if (err || !user) {
            const target = returnTo ? new URL(returnTo) : new URL('/login', process.env.FRONTEND_URL || 'http://localhost:5173');
            target.searchParams.set('error', 'auth_failed');
            if (err?.message)
                target.searchParams.set('message', err.message);
            return res.redirect(target.toString());
        }

        try {
            const session = createSessionToken(user._id.toString());
            if (returnTo) {
                const target = new URL(returnTo);
                target.searchParams.set('session', session);
                return res.redirect(target.toString());
            }
            res.setHeader('Set-Cookie', buildSessionCookie(String(user._id)));
            const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontend}/auth/callback?session=${encodeURIComponent(session)}`);
        }
        catch (error: any) {
            const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
            return res.redirect(`${frontend}/login?error=auth_failed&message=${encodeURIComponent(error.message || 'Session failed')}`);
        }
    })(req, res);
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        res.json({ success: true, user: serializeUser(req.user) });
    }
    catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const logout = async (_req: AuthRequest, res: Response) => {
    res.setHeader('Set-Cookie', clearSessionCookie());
    res.json({ success: true, message: 'Logged out successfully' });
};
