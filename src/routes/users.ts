import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// all routes protected
router.use(authMiddleware);

// Dashboard
router.get('/dashboard', UserController.getDashboard);

// Stats
router.get('/stats', UserController.getUserStats);

// Booking history
router.get('/bookings', UserController.getBookingHistory);

export default router;