"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// All routes protected
router.use(auth_1.authMiddleware);
// Dashboard - GET /api/users/dashboard
router.get('/dashboard', userController_1.UserController.getDashboard);
// Stats - GET /api/users/stats
router.get('/stats', userController_1.UserController.getUserStats);
// Booking history - GET /api/users/bookings
router.get('/bookings', userController_1.UserController.getBookingHistory);
// Profile - GET/PUT /api/users/profile
router.get('/profile', userController_1.UserController.getProfile);
router.put('/profile', userController_1.UserController.updateProfile);
exports.default = router;
//# sourceMappingURL=users.js.map