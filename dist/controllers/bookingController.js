"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingController = void 0;
const database_1 = __importDefault(require("../config/database"));
const bookingService_1 = require("../services/bookingService");
class BookingController {
    // Create Booking
    static async createBooking(req, res) {
        try {
            const { tutorId, date, duration, notes } = req.body;
            if (!tutorId || !date || !duration) {
                return res.status(400).json({
                    success: false,
                    message: 'tutorId, date, duration are required',
                });
            }
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid date format'
                });
            }
            const booking = await bookingService_1.BookingService.createBooking({
                studentId: req.user.id,
                tutorId: String(tutorId),
                date: parsedDate,
                duration: Number(duration),
                notes,
            });
            return res.status(201).json({
                success: true,
                message: 'Booking created successfully',
                data: booking,
            });
        }
        catch (error) {
            console.error('Create booking error:', error);
            if (error.message === 'Tutor not found' ||
                error.message === 'Tutor profile not found') {
                return res.status(404).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message === 'Tutor account is inactive') {
                return res.status(403).json({
                    success: false,
                    message: error.message
                });
            }
            if (error.message === 'Tutor is already booked at this time') {
                return res.status(409).json({
                    success: false,
                    message: error.message
                });
            }
            return res.status(500).json({
                success: false,
                message: error.message || 'Error creating booking',
            });
        }
    }
    // Get User Bookings
    static async getUserBookings(req, res) {
        try {
            const status = req.query.status;
            const type = req.query.type;
            const page = Number(req.query.page || 1);
            const limit = Number(req.query.limit || 10);
            let bookings = [];
            if (type === 'upcoming') {
                bookings = await bookingService_1.BookingService.getUpcomingBookings(req.user.id, req.user.role);
            }
            else if (type === 'past') {
                bookings = await bookingService_1.BookingService.getPastBookings(req.user.id, req.user.role);
            }
            else {
                bookings = await bookingService_1.BookingService.getUserBookings(req.user.id, req.user.role);
            }
            if (status && status !== 'ALL') {
                bookings = bookings.filter(b => b.status === status);
            }
            const start = (page - 1) * limit;
            const paginated = bookings.slice(start, start + limit);
            return res.json({
                success: true,
                data: paginated,
                pagination: {
                    total: bookings.length,
                    page,
                    limit,
                    totalPages: Math.ceil(bookings.length / limit),
                },
            });
        }
        catch (error) {
            console.error('Get bookings error:', error);
            return res.status(500).json({
                message: error.message || 'Error fetching bookings',
            });
        }
    }
    // Get Booking By ID
    static async getBookingById(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({ message: 'Booking ID is required' });
            }
            const booking = await bookingService_1.BookingService.getBookingById(String(id), req.user.id, req.user.role);
            return res.json({
                success: true,
                data: booking,
            });
        }
        catch (error) {
            console.error('Get booking error:', error);
            if (error.message === 'Booking not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('permission')) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || 'Error fetching booking',
            });
        }
    }
    // Update Status
    static async updateStatus(req, res) {
        try {
            const id = req.params.id;
            const status = req.body.status;
            if (!id || !status) {
                return res.status(400).json({
                    message: 'Booking ID and status are required',
                });
            }
            const booking = await bookingService_1.BookingService.updateStatus(String(id), status, req.user.id, req.user.role);
            return res.json({
                success: true,
                message: `Booking ${status.toLowerCase()} successfully`,
                data: booking,
            });
        }
        catch (error) {
            console.error('Update status error:', error);
            if (error.message === 'Booking not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('Invalid') || error.message.includes('Cannot')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('permission')) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || 'Error updating booking',
            });
        }
    }
    // Cancel Booking
    static async cancelBooking(req, res) {
        try {
            const id = req.params.id;
            const reason = req.body.reason;
            if (!id) {
                return res.status(400).json({ message: 'Booking ID is required' });
            }
            const booking = await bookingService_1.BookingService.cancelBooking(String(id), req.user.id, req.user.role, reason);
            return res.json({
                success: true,
                message: 'Booking cancelled successfully',
                data: booking,
            });
        }
        catch (error) {
            console.error('Cancel booking error:', error);
            if (error.message === 'Booking not found') {
                return res.status(404).json({ message: error.message });
            }
            if (error.message.includes('Cannot')) {
                return res.status(400).json({ message: error.message });
            }
            if (error.message.includes('permission')) {
                return res.status(403).json({ message: error.message });
            }
            return res.status(500).json({
                message: error.message || 'Error cancelling booking',
            });
        }
    }
    // Get Upcoming Bookings
    static async getUpcomingBookings(req, res) {
        try {
            const bookings = await bookingService_1.BookingService.getUpcomingBookings(req.user.id, req.user.role);
            return res.json({
                success: true,
                data: bookings,
                count: bookings.length
            });
        }
        catch (error) {
            console.error('Get upcoming bookings error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching upcoming bookings',
            });
        }
    }
    // Get Past Bookings
    static async getPastBookings(req, res) {
        try {
            const bookings = await bookingService_1.BookingService.getPastBookings(req.user.id, req.user.role);
            return res.json({
                success: true,
                data: bookings,
                count: bookings.length
            });
        }
        catch (error) {
            console.error('Get past bookings error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching past bookings',
            });
        }
    }
    // Get Booking Statistics
    static async getBookingStats(req, res) {
        try {
            const bookings = await bookingService_1.BookingService.getUserBookings(req.user.id, req.user.role);
            const now = new Date();
            // Calculate statistics
            const stats = {
                total: bookings.length,
                upcoming: bookings.filter(b => new Date(b.date) > now && b.status === 'CONFIRMED').length,
                completed: bookings.filter(b => b.status === 'COMPLETED').length,
                cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
                totalSpent: bookings
                    .filter(b => b.status === 'COMPLETED')
                    .reduce((sum, b) => sum + b.totalAmount, 0),
                averageRating: 0,
            };
            // Calculate average rating 
            const completedWithReviews = bookings.filter(b => b.status === 'COMPLETED' && b.review);
            if (completedWithReviews.length > 0) {
                const totalRating = completedWithReviews.reduce((sum, b) => sum + (b.review?.rating || 0), 0);
                stats.averageRating = totalRating / completedWithReviews.length;
            }
            return res.json({
                success: true,
                data: stats
            });
        }
        catch (error) {
            console.error('Get stats error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching statistics'
            });
        }
    }
    // Check Availability
    static async checkAvailability(req, res) {
        try {
            const { tutorId, date } = req.body;
            if (!tutorId || !date) {
                return res.status(400).json({
                    message: 'tutorId and date are required',
                });
            }
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return res.status(400).json({ message: 'Invalid date format' });
            }
            const existingBooking = await database_1.default.booking.findFirst({
                where: {
                    tutorId: String(tutorId),
                    date: parsedDate,
                    status: {
                        not: 'CANCELLED',
                    },
                },
            });
            return res.json({
                success: true,
                data: {
                    isAvailable: !existingBooking,
                    message: existingBooking
                        ? 'Tutor is already booked'
                        : 'Tutor is available',
                },
            });
        }
        catch (error) {
            console.error('Availability error:', error);
            return res.status(500).json({
                message: error.message || 'Error checking availability',
            });
        }
    }
}
exports.BookingController = BookingController;
//# sourceMappingURL=bookingController.js.map