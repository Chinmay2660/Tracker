import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import passport from "passport";
import path from "path";

// Load environment variables FIRST before importing anything that uses them
dotenv.config();

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/auth";
import columnRoutes from "./routes/columns";
import jobRoutes from "./routes/jobs";
import interviewRoutes from "./routes/interviews";
import resumeRoutes from "./routes/resumes";
import "./config/passport";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Serve static files for uploads (only in non-serverless environments)
if (process.env.VERCEL !== '1') {
  app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
}

// Routes
app.use("/auth", authRoutes);
app.use("/columns", columnRoutes);
app.use("/jobs", jobRoutes);
app.use("/interviews", interviewRoutes);
app.use("/resumes", resumeRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({ 
    message: "Job Tracker API",
    status: "running",
    version: "1.0.0"
  });
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// OAuth test endpoint
app.get("/auth/test", (req, res) => {
  res.json({ 
    oauthConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    clientId: process.env.GOOGLE_CLIENT_ID ? `${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...` : 'Not set',
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    frontendUrl: process.env.FRONTEND_URL
  });
});

// 404 handler (must be before error handler)
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB (non-blocking)
if (process.env.MONGODB_URI) {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
      console.log("✅ Connected to MongoDB");
    })
    .catch((error: any) => {
      console.error("⚠️  MongoDB connection error:", error.message);
      // Don't block serverless function initialization
    });
} else {
  console.warn("⚠️  MONGODB_URI not set");
}

// Export for Vercel serverless (must be at the end)
module.exports = app;

// Start server only if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/health`);
    console.log(`🔐 OAuth endpoint: http://localhost:${PORT}/auth/google`);
  });
}
