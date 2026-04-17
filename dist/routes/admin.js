"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.use((0, auth_1.roleMiddleware)('ADMIN'));
// Dashboard & Stats
router.get('/dashboard/stats', adminController_1.AdminController.getDashboardStats);
router.get('/analytics/platform', adminController_1.AdminController.getPlatformAnalytics);
router.get('/health', adminController_1.AdminController.getSystemHealth);
// User Management
router.get('/users', adminController_1.AdminController.getAllUsers);
router.get('/users/:id', adminController_1.AdminController.getUserDetails);
router.patch('/users/:id/status', adminController_1.AdminController.updateUserStatus);
router.delete('/users/:id', adminController_1.AdminController.deleteUser);
// Booking Management
router.get('/bookings', adminController_1.AdminController.getAllBookings);
router.get('/bookings/:id', adminController_1.AdminController.getBookingDetails);
router.post('/bookings/:id/cancel', adminController_1.AdminController.cancelBooking);
// Category Management
router.get('/categories', adminController_1.AdminController.getAllCategories);
router.post('/categories', adminController_1.AdminController.createCategory);
router.put('/categories/:id', adminController_1.AdminController.updateCategory);
router.delete('/categories/:id', adminController_1.AdminController.deleteCategory);
exports.default = router;
//# sourceMappingURL=admin.js.map