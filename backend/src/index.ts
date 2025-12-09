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

// Serve static files for uploads
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/auth", authRoutes);
app.use("/columns", columnRoutes);
app.use("/jobs", jobRoutes);
app.use("/interviews", interviewRoutes);
app.use("/resumes", resumeRoutes);

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

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 OAuth endpoint: http://localhost:${PORT}/auth/google`);
});

// Connect to MongoDB (non-blocking)
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/job-tracker")
  .then(() => {
    console.log("✅ Connected to MongoDB");
  })
  .catch((error) => {
    console.error("⚠️  MongoDB connection error:", error.message);
    console.error("   Server is running but database features may not work.");
    console.error("   To fix: Start MongoDB or update MONGODB_URI in .env");
  });
