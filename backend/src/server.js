const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const env = require('./config/env');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const { apiLimiter } = require('./middlewares/rateLimiter');
const { initAdminUser } = require('./services/adminInitService');
const { verifySMTP } = require('./services/emailService');

// Import routes
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const requestRoutes = require('./routes/requestRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const savedResourceRoutes = require('./routes/savedResourceRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Database Connection
connectDB();

// Security and utility middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Global API rate limiter
app.use('/api', apiLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    platform: 'AI-Powered Agricultural Resource Sharing and Intelligent Farmer Assistance Platform',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/farmers', farmerRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/resource-requests', requestRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/saved-resources', savedResourceRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);

// Error Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌾 AgriShare Backend Server running on port ${PORT}`);
  console.log(`📡 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
  verifySMTP();
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n[Server] Port ${PORT} is already in use. Close the other backend terminal (Ctrl+C) and run again.\n`);
    process.exit(1);
  }
  throw err;
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`[Unhandled Rejection] ${err.message}`);
});

module.exports = app;
