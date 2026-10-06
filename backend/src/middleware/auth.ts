import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getSessionUserIdFromAuthHeader, getSessionUserIdFromRequest } from '../lib/session';

export interface AuthRequest extends Request {
    user?: any;
    body: any;
    params: any;
    headers: any;
    file?: Express.Multer.File;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const sessionUserId = getSessionUserIdFromRequest(req.headers.cookie)
            || getSessionUserIdFromAuthHeader(req.headers.authorization);
        if (sessionUserId) {
            const user = await User.findById(sessionUserId);
            if (!user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }
            req.user = user;
            return next();
        }

        const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
        if (bearer && process.env.JWT_SECRET) {
            try {
                const decoded = jwt.verify(bearer, process.env.JWT_SECRET) as { userId?: string };
                if (decoded.userId) {
                    const user = await User.findById(decoded.userId);
                    if (user) {
                        req.user = user;
                        return next();
                    }
                }
            }
            catch {
                // ponytail: Bearer may be a platform session token, not a JWT — ignore malformed JWT
            }
        }

        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    catch {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
};
