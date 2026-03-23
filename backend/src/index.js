require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./modules/auth/auth.routes');
const subjectsRoutes = require('./modules/subjects/subjects.routes');
const videosRoutes = require('./modules/videos/videos.routes');
const progressRoutes = require('./modules/progress/progress.routes');
const enrollmentsRoutes = require('./modules/enrollments/enrollments.routes');
const adminRoutes = require('./modules/admin/admin.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// ======================
// Middleware
// ======================

// CORS — allow frontend origin with credentials
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());

// Parse cookies (for refresh tokens)
app.use(cookieParser());

// ======================
// Routes
// ======================

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/admin', adminRoutes);

// ======================
// Error Handler (must be last)
// ======================

app.use(errorHandler);

// ======================
// Start Server
// ======================

app.listen(PORT, () => {
  console.log(`🚀 LMS Backend running on http://localhost:${PORT}`);
  console.log(`   Health check: http://localhost:${PORT}/api/health`);
});
