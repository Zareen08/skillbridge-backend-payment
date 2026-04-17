"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bookingController_1 = require("../controllers/bookingController");
const auth_1 = require("../middleware/auth");
const validator_1 = require("../utils/validator");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
router.post('/', (0, auth_1.roleMiddleware)('STUDENT'), validator_1.bookingValidation, validator_1.validate, bookingController_1.BookingController.createBooking);
router.get('/', bookingController_1.BookingController.getUserBookings);
router.get('/upcoming', bookingController_1.BookingController.getUpcomingBookings);
router.get('/past', bookingController_1.BookingController.getPastBookings);
router.get('/stats', bookingController_1.BookingController.getBookingStats);
router.post('/check-availability', (0, auth_1.roleMiddleware)('STUDENT'), bookingController_1.BookingController.checkAvailability);
router.get('/:id', bookingController_1.BookingController.getBookingById);
router.patch('/:id/status', bookingController_1.BookingController.updateStatus);
router.post('/:id/cancel', bookingController_1.BookingController.cancelBooking);
exports.default = router;
//# sourceMappingURL=bookings.js.map