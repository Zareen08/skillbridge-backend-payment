import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import tutorRoutes from './routes/tutors';
import bookingRoutes from './routes/bookings';
import reviewRoutes from './routes/reviews';
import categoryRoutes from './routes/categories';
import adminRoutes from './routes/admin';

// Import middleware
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'SkillBridge API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      tutors: '/api/tutors',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      categories: '/api/categories',
      admin: '/api/admin'
    }
  });
});

// Auth routes 
app.use('/api/auth', authRoutes);

// User routes 
app.use('/api/users', userRoutes);

// Tutor routes 
app.use('/api/tutors', tutorRoutes);

// Booking routes 
app.use('/api/bookings', bookingRoutes);

// Review routes 
app.use('/api/reviews', reviewRoutes);

// Category routes 
app.use('/api/categories', categoryRoutes);

// Admin routes 
app.use('/api/admin', adminRoutes);

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.url} not found`
  });
});

// Global error handler
app.use(errorHandler);

export default app;