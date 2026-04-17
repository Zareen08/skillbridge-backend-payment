"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewService = void 0;
const database_1 = __importDefault(require("../config/database"));
class ReviewService {
    static async createReview(data) {
        // Check if booking exists and is completed
        const booking = await database_1.default.booking.findFirst({
            where: {
                id: data.bookingId,
                studentId: data.studentId,
                status: 'COMPLETED',
            },
        });
        if (!booking) {
            throw new Error('Booking not found or not completed');
        }
        // Check if review already exists
        const existingReview = await database_1.default.review.findUnique({
            where: { bookingId: data.bookingId },
        });
        if (existingReview) {
            throw new Error('Review already exists for this booking');
        }
        // Create review
        const review = await database_1.default.review.create({
            data: {
                rating: data.rating,
                comment: data.comment,
                studentId: data.studentId,
                tutorId: data.tutorId,
                bookingId: data.bookingId,
            },
            include: {
                student: {
                    select: { name: true, avatar: true },
                },
                booking: true,
            },
        });
        // Update booking isReviewed flag
        await database_1.default.booking.update({
            where: { id: data.bookingId },
            data: { isReviewed: true },
        });
        // Update tutor rating
        await this.updateTutorRating(data.tutorId);
        return review;
    }
    static async getTutorReviews(tutorId) {
        return await database_1.default.review.findMany({
            where: { tutorId },
            include: {
                student: {
                    select: { name: true, avatar: true },
                },
                booking: {
                    select: { date: true, duration: true },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
    static async updateTutorRating(tutorId) {
        const reviews = await database_1.default.review.findMany({
            where: { tutorId },
        });
        if (reviews.length > 0) {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            await database_1.default.tutorProfile.update({
                where: { userId: tutorId },
                data: {
                    rating: avgRating,
                    totalReviews: reviews.length,
                },
            });
        }
        else {
            await database_1.default.tutorProfile.update({
                where: { userId: tutorId },
                data: {
                    rating: 0,
                    totalReviews: 0,
                },
            });
        }
    }
    static async deleteReview(reviewId, userId, userRole) {
        const existingReview = await database_1.default.review.findUnique({
            where: { id: reviewId },
        });
        if (!existingReview) {
            throw new Error('Review not found');
        }
        if (existingReview.studentId !== userId && userRole !== 'ADMIN') {
            throw new Error('Forbidden');
        }
        await database_1.default.review.delete({
            where: { id: reviewId },
        });
        // Update booking isReviewed flag
        await database_1.default.booking.update({
            where: { id: existingReview.bookingId },
            data: { isReviewed: false },
        });
        // Recalculate tutor rating
        await this.updateTutorRating(existingReview.tutorId);
        return { message: 'Review deleted successfully' };
    }
}
exports.ReviewService = ReviewService;
//# sourceMappingURL=reviewService.js.map