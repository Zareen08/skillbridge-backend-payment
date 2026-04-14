import { Router } from 'express';
import { TutorController } from '../controllers/tutorController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Get all tutors with filters
router.get('/', TutorController.getAllTutors);

// Get featured tutors 
router.get('/featured', TutorController.getFeaturedTutors);

// Get top rated tutors
router.get('/top-rated', TutorController.getTopRated);

// Search tutors by subject
router.get('/search/subject/:subject', TutorController.searchBySubject);

// Profile routes
router.get('/profile', authMiddleware, roleMiddleware('TUTOR'), TutorController.getMyProfile);
router.put('/profile', authMiddleware, roleMiddleware('TUTOR'), TutorController.updateProfile);

// Availability routes
router.get('/my-availability', authMiddleware, roleMiddleware('TUTOR'), TutorController.getMyAvailability);
router.put('/availability', authMiddleware, roleMiddleware('TUTOR'), TutorController.updateAvailability);

// Bookings and stats
router.get('/my-bookings', authMiddleware, roleMiddleware('TUTOR'), TutorController.getMyBookings);
router.get('/my-stats', authMiddleware, roleMiddleware('TUTOR'), TutorController.getMyStats);

// Get single tutor by ID 
router.get('/:id', TutorController.getTutorById);

export default router;