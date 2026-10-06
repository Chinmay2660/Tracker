import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    username?: string;
    authCodeHash?: string;
    name: string;
    email?: string;
    avatar?: string;
    googleId?: string;
    onboardingComplete?: boolean;
    isGuest?: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    username: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    authCodeHash: { type: String, select: false },
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    avatar: { type: String },
    googleId: { type: String, unique: true, sparse: true },
    onboardingComplete: { type: Boolean, default: true },
    isGuest: { type: Boolean, default: false },
}, { timestamps: true });

export function serializeUser(user: IUser) {
    return {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        googleId: user.googleId,
        isGuest: user.isGuest,
    };
}

export default mongoose.model<IUser>('User', UserSchema);
