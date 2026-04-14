import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes protected
router.use(authMiddleware);

// Dashboard - GET /api/users/dashboard
router.get('/dashboard', UserController.getDashboard);

// Stats - GET /api/users/stats
router.get('/stats', UserController.getUserStats);

// Booking history - GET /api/users/bookings
router.get('/bookings', UserController.getBookingHistory);

// Profile - GET/PUT /api/users/profile
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);

export default router;