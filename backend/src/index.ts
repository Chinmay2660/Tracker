import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import path from "path";
dotenv.config();
import { isOriginAllowedForBrowser } from "./config/allowedOrigins";
import { errorHandler } from "./middleware/errorHandler";
import { securityHeaders, additionalSecurityHeaders, validateRequestSize } from "./middleware/security";
import { apiLimiter } from "./middleware/rateLimiter";
import { sanitizeInput } from "./middleware/sanitize";
import { csrfProtection } from "./middleware/csrf";
import authRoutes from "./routes/auth";
import columnRoutes from "./routes/columns";
import jobRoutes from "./routes/jobs";
import interviewRoutes from "./routes/interviews";
import resumeRoutes from "./routes/resumes";
import hrContactRoutes from "./routes/hrContacts";
import publicRoutes from "./routes/publicHrContacts";
import "./config/passport";
const app = express();
const PORT = process.env.PORT || 8000;
if (process.env.VERCEL || process.env.RAILWAY_ENVIRONMENT || process.env.TRUST_PROXY === "1") {
    app.set("trust proxy", 1);
}
app.use(securityHeaders);
app.use(additionalSecurityHeaders);
app.use(validateRequestSize);
app.use(cors({
    origin: (requestOrigin, callback) => {
        if (!requestOrigin) {
            return callback(null, true);
        }
        if (isOriginAllowedForBrowser(requestOrigin)) {
            return callback(null, true);
        }
        return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sanitizeInput);
app.use(csrfProtection);
app.use(apiLimiter);
app.use(passport.initialize());
if (process.env.VERCEL !== '1') {
    app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}
app.use("/auth", authRoutes);
app.use("/columns", columnRoutes);
app.use("/jobs", jobRoutes);
app.use("/interviews", interviewRoutes);
app.use("/resumes", resumeRoutes);
app.use("/hr-contacts", hrContactRoutes);
app.use("/public", publicRoutes);
app.get("/", (req, res) => {
    res.json({
        message: "Job Tracker API",
        status: "running",
        version: "1.0.0"
    });
});
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});
app.get("/auth/test", (req, res) => {
    res.json({
        oauthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
        clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Not set',
        callbackUrl: process.env.GOOGLE_CALLBACK_URL,
        frontendUrl: process.env.FRONTEND_URL
    });
});
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
        method: req.method
    });
});
app.use(errorHandler);
const connectMongoDB = async () => {
    if (!process.env.MONGODB_URI) {
        console.warn("⚠️  MONGODB_URI not set");
        return;
    }
    if (mongoose.connection.readyState === 1) {
        console.log("✅ MongoDB already connected");
        return;
    }
    const mongooseOptions = {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 15000,
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
    };
    try {
        await mongoose.connect(process.env.MONGODB_URI, mongooseOptions);
        console.log("✅ Connected to MongoDB");
    }
    catch (error: any) {
        console.error("⚠️  MongoDB connection error:", error.message);
    }
};
connectMongoDB();
module.exports = app;
if (process.env.VERCEL !== '1') {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
        console.log(`📡 Health check: http://localhost:${PORT}/health`);
        console.log(`🔐 OAuth endpoint: http://localhost:${PORT}/auth/google`);
    });
}
