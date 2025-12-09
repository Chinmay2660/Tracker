// Vercel serverless function entry point
// This file requires the built Express app from dist/index.js
try {
  const app = require('../dist/index.js');
  module.exports = app;
} catch (error) {
  console.error('Error loading Express app:', error);
  // Fallback handler
  const express = require('express');
  const fallbackApp = express();
  fallbackApp.all('*', (req, res) => {
    res.status(500).json({ 
      success: false, 
      error: 'Server initialization failed',
      message: error.message 
    });
  });
  module.exports = fallbackApp;
}
