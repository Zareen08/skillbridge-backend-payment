"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingService = void 0;
const database_1 = __importDefault(require("../config/database"));
class BookingService {
    static async createBooking(data) {
        try {
            // Get tutor details
            const tutor = await database_1.default.user.findUnique({
                where: { id: data.tutorId },
                include: { tutorProfile: true }
            });
            if (!tutor || tutor.role !== 'TUTOR') {
                throw new Error('Tutor not found');
            }
            if (!tutor.isActive) {
                throw new Error('Tutor account is inactive');
            }
            if (!tutor.tutorProfile) {
                throw new Error('Tutor profile not found');
            }
            const newStart = new Date(data.date);
            const newEnd = new Date(newStart.getTime() + data.duration * 60000);
            // FIX: Proper conflict detection without invalid include
            const conflictingBookings = await database_1.default.booking.findMany({
                where: {
                    tutorId: data.tutorId,
                    status: { not: 'CANCELLED' }
                }
            });
            // Check for time overlap
            const hasConflict = conflictingBookings.some(booking => {
                const bookingStart = new Date(booking.date);
                const bookingEnd = new Date(bookingStart.getTime() + booking.duration * 60000);
                // Check if time ranges overlap
                const overlap = (newStart < bookingEnd && newEnd > bookingStart);
                return overlap;
            });
            if (hasConflict) {
                throw new Error('Tutor is already booked at this time');
            }
            // Calculate total amount
            const totalAmount = (tutor.tutorProfile.hourlyRate * data.duration) / 60;
            // Create booking
            const booking = await database_1.default.booking.create({
                data: {
                    studentId: data.studentId,
                    tutorId: data.tutorId,
                    date: newStart,
                    duration: data.duration,
                    totalAmount,
                    notes: data.notes,
                    status: 'CONFIRMED',
                    paymentStatus: 'pending',
                    isReviewed: false,
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    tutor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            tutorProfile: {
                                select: {
                                    id: true,
                                    title: true,
                                    hourlyRate: true
                                }
                            }
                        }
                    }
                }
            });
            return booking;
        }
        catch (error) {
            console.error('Error in createBooking:', error);
            throw error;
        }
    }
    static async getUserBookings(userId, role) {
        try {
            const where = {};
            if (role === 'STUDENT') {
                where.studentId = userId;
            }
            else if (role === 'TUTOR') {
                where.tutorId = userId;
            }
            else {
                throw new Error('Invalid role');
            }
            const bookings = await database_1.default.booking.findMany({
                where,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    tutor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            tutorProfile: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    },
                    review: true,
                },
                orderBy: { date: 'desc' }
            });
            return bookings;
        }
        catch (error) {
            console.error('Error in getUserBookings:', error);
            throw error;
        }
    }
    static async getBookingById(bookingId, userId, role) {
        try {
            const booking = await database_1.default.booking.findUnique({
                where: { id: bookingId },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            studentProfile: true
                        }
                    },
                    tutor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            tutorProfile: true
                        }
                    },
                    review: true,
                }
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            // Check if user has access
            if (role !== 'ADMIN' && booking.studentId !== userId && booking.tutorId !== userId) {
                throw new Error('You do not have permission to view this booking');
            }
            return booking;
        }
        catch (error) {
            console.error('Error in getBookingById:', error);
            throw error;
        }
    }
    static async updateStatus(bookingId, newStatus, userId, role) {
        try {
            // Validate status
            const validStatuses = ['CONFIRMED', 'COMPLETED', 'CANCELLED'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
            }
            // Check if booking exists
            const booking = await database_1.default.booking.findUnique({
                where: { id: bookingId },
                include: {
                    student: true,
                    tutor: {
                        include: { tutorProfile: true }
                    }
                }
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            // Check permissions
            if (role === 'STUDENT' && booking.studentId !== userId) {
                throw new Error('You can only update your own bookings');
            }
            if (role === 'TUTOR' && booking.tutorId !== userId) {
                throw new Error('You can only update bookings for your sessions');
            }
            // Prevent invalid status transitions
            if (booking.status === 'COMPLETED') {
                throw new Error('Cannot update a completed booking');
            }
            if (booking.status === 'CANCELLED') {
                throw new Error('Cannot update a cancelled booking');
            }
            // Update booking
            const updatedBooking = await database_1.default.booking.update({
                where: { id: bookingId },
                data: {
                    status: newStatus,
                    updatedAt: new Date()
                },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    tutor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            tutorProfile: {
                                select: {
                                    id: true,
                                    title: true,
                                    hourlyRate: true
                                }
                            }
                        }
                    },
                    review: true,
                }
            });
            if (newStatus === 'COMPLETED') {
                await this.updateTutorRating(booking.tutorId);
            }
            return updatedBooking;
        }
        catch (error) {
            console.error('Error in updateStatus:', error);
            throw error;
        }
    }
    static async updateTutorRating(tutorId) {
        try {
            const reviews = await database_1.default.review.findMany({
                where: { tutorId }
            });
            if (reviews.length > 0) {
                const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
                const avgRating = totalRating / reviews.length;
                await database_1.default.tutorProfile.update({
                    where: { userId: tutorId },
                    data: {
                        rating: avgRating,
                        totalReviews: reviews.length,
                    }
                });
            }
        }
        catch (error) {
            console.error('Error in updateTutorRating:', error);
            throw error;
        }
    }
    static async cancelBooking(bookingId, userId, role, reason) {
        try {
            const booking = await database_1.default.booking.findUnique({
                where: { id: bookingId }
            });
            if (!booking) {
                throw new Error('Booking not found');
            }
            // Check permissions
            if (role === 'STUDENT' && booking.studentId !== userId) {
                throw new Error('You can only cancel your own bookings');
            }
            if (role === 'TUTOR' && booking.tutorId !== userId) {
                throw new Error('You can only cancel bookings for your sessions');
            }
            if (booking.status === 'COMPLETED') {
                throw new Error('Cannot cancel a completed booking');
            }
            if (booking.status === 'CANCELLED') {
                throw new Error('Booking is already cancelled');
            }
            const cancelledBooking = await database_1.default.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CANCELLED',
                    notes: reason ? `${booking.notes || ''}\nCancellation reason: ${reason}` : booking.notes,
                    updatedAt: new Date()
                }
            });
            return cancelledBooking;
        }
        catch (error) {
            console.error('Error in cancelBooking:', error);
            throw error;
        }
    }
    static async getUpcomingBookings(userId, role) {
        try {
            const where = {
                date: { gte: new Date() },
                status: 'CONFIRMED'
            };
            if (role === 'STUDENT') {
                where.studentId = userId;
            }
            else if (role === 'TUTOR') {
                where.tutorId = userId;
            }
            else {
                throw new Error('Invalid role');
            }
            const bookings = await database_1.default.booking.findMany({
                where,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    tutor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            tutorProfile: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    },
                    review: true,
                },
                orderBy: { date: 'asc' }
            });
            return bookings;
        }
        catch (error) {
            console.error('Error in getUpcomingBookings:', error);
            throw error;
        }
    }
    static async getPastBookings(userId, role) {
        try {
            const where = {
                date: { lt: new Date() },
                OR: [
                    { status: 'COMPLETED' },
                    { status: 'CANCELLED' }
                ]
            };
            if (role === 'STUDENT') {
                where.studentId = userId;
            }
            else if (role === 'TUTOR') {
                where.tutorId = userId;
            }
            else {
                throw new Error('Invalid role');
            }
            const bookings = await database_1.default.booking.findMany({
                where,
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    },
                    tutor: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            tutorProfile: {
                                select: {
                                    id: true,
                                    title: true
                                }
                            }
                        }
                    },
                    review: true,
                },
                orderBy: { date: 'desc' }
            });
            return bookings;
        }
        catch (error) {
            console.error('Error in getPastBookings:', error);
            throw error;
        }
    }
}
exports.BookingService = BookingService;
//# sourceMappingURL=bookingService.js.map