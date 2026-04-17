"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const tutorController_1 = require("../controllers/tutorController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all tutors with filters
router.get('/', tutorController_1.TutorController.getAllTutors);
// Get featured tutors 
router.get('/featured', tutorController_1.TutorController.getFeaturedTutors);
// Get top rated tutors
router.get('/top-rated', tutorController_1.TutorController.getTopRated);
// Search tutors by subject
router.get('/search/subject/:subject', tutorController_1.TutorController.searchBySubject);
// Profile routes
router.get('/profile', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('TUTOR'), tutorController_1.TutorController.getMyProfile);
router.put('/profile', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('TUTOR'), tutorController_1.TutorController.updateProfile);
// Availability routes
router.get('/my-availability', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('TUTOR'), tutorController_1.TutorController.getMyAvailability);
router.put('/availability', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('TUTOR'), tutorController_1.TutorController.updateAvailability);
// Bookings and stats
router.get('/my-bookings', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('TUTOR'), tutorController_1.TutorController.getMyBookings);
router.get('/my-stats', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('TUTOR'), tutorController_1.TutorController.getMyStats);
// Get single tutor by ID 
router.get('/:id', tutorController_1.TutorController.getTutorById);
exports.default = router;
//# sourceMappingURL=tutors.js.map