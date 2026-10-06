import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { getSessionUserIdFromRequest } from '../lib/session';

export interface AuthRequest extends Request {
    user?: any;
    body: any;
    params: any;
    headers: any;
    file?: Express.Multer.File;
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const sessionUserId = getSessionUserIdFromRequest(req.headers.cookie);
        if (sessionUserId) {
            const user = await User.findById(sessionUserId);
            if (!user) {
                return res.status(401).json({ success: false, error: 'User not found' });
            }
            req.user = user;
            return next();
        }

        const token = req.headers.authorization?.replace('Bearer ', '');
        if (token && process.env.JWT_SECRET) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId?: string };
            if (decoded.userId) {
                const user = await User.findById(decoded.userId);
                if (user) {
                    req.user = user;
                    return next();
                }
            }
        }

        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    catch {
        return res.status(401).json({ success: false, error: 'Invalid token' });
    }
};
