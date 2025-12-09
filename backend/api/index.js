// Vercel serverless function entry point
// This file requires the built Express app from dist/index.js
console.log('Loading Express app from dist/index.js...');
try {
  const app = require('../dist/index.js');
  console.log('Express app loaded successfully');
  module.exports = app;
} catch (error) {
  console.error('Error loading Express app:', error);
  console.error('Error stack:', error.stack);
  // Fallback handler
  const express = require('express');
  const fallbackApp = express();
  fallbackApp.use(express.json());
  fallbackApp.all('*', (req, res) => {
    console.log(`Fallback handler: ${req.method} ${req.path}`);
    res.status(500).json({ 
      success: false, 
      error: 'Server initialization failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  });
  module.exports = fallbackApp;
}
