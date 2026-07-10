const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const { testConnection } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// =============================================
// MIDDLEWARE
// =============================================

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically (for development)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =============================================
// ROUTES
// =============================================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'AI Resume Analyzer API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/analysis', analysisRoutes);

// 404 handler for unknown routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// =============================================
// ERROR HANDLER (must be last)
// =============================================
app.use(errorHandler);

// =============================================
// START SERVER
// =============================================
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️  Starting server without database connection');
    console.error('   Make sure MySQL is running and .env is configured');
  }

  app.listen(PORT, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║     AI Resume Analyzer API Server             ║
    ║───────────────────────────────────────────────║
    ║   🚀 Server:  http://localhost:${PORT}           ║
    ║   📊 Health:  http://localhost:${PORT}/api/health ║
    ║   🌍 Env:     ${process.env.NODE_ENV || 'development'}                     ║
    ║   🗄️  DB:      ${dbConnected ? 'Connected ✅' : 'Disconnected ❌'}               ║
    ╚═══════════════════════════════════════════════╝
    `);
  });
}

startServer();

module.exports = app;
