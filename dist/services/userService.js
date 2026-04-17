"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const database_1 = __importDefault(require("../config/database"));
class UserService {
    // Get Dashboard Data
    static async getDashboardData(userId, role) {
        try {
            if (role === 'STUDENT') {
                const stats = await this.getUserStats(userId);
                const bookings = await this.getBookingHistory(userId, role);
                // Get user with interests
                const user = await database_1.default.user.findUnique({
                    where: { id: userId },
                    include: { studentProfile: true },
                });
                let recommendedTutors = [];
                // FIXED: Safe interests check
                const interests = user?.studentProfile?.interests;
                if (Array.isArray(interests) && interests.length > 0) {
                    recommendedTutors = await database_1.default.tutorProfile.findMany({
                        where: {
                            AND: [
                                {
                                    subjects: {
                                        hasSome: interests,
                                    },
                                },
                                {
                                    user: {
                                        isActive: true,
                                    },
                                },
                            ],
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                        orderBy: {
                            rating: 'desc',
                        },
                        take: 5,
                    });
                }
                else {
                    // fallback 
                    recommendedTutors = await database_1.default.tutorProfile.findMany({
                        where: {
                            user: {
                                isActive: true,
                            },
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    avatar: true,
                                },
                            },
                        },
                        orderBy: {
                            rating: 'desc',
                        },
                        take: 5,
                    });
                }
                return {
                    stats,
                    bookings,
                    recommendedTutors,
                    recentActivity: bookings.upcoming.slice(0, 5),
                };
            }
            // TUTOR DASHBOARD
            else if (role === 'TUTOR') {
                const stats = await this.getUserStats(userId);
                const bookings = await this.getBookingHistory(userId, role);
                const recentReviews = await database_1.default.review.findMany({
                    where: { tutorId: userId },
                    include: {
                        student: {
                            select: {
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                });
                return {
                    stats,
                    bookings,
                    upcomingSessions: bookings.upcoming.slice(0, 5),
                    recentReviews,
                };
            }
            // ADMIN DASHBOARD
            else {
                const totalUsers = await database_1.default.user.count();
                const totalTutors = await database_1.default.user.count({
                    where: { role: 'TUTOR' },
                });
                const totalStudents = await database_1.default.user.count({
                    where: { role: 'STUDENT' },
                });
                const totalBookings = await database_1.default.booking.count();
                const totalRevenue = await database_1.default.booking.aggregate({
                    where: { status: 'COMPLETED' },
                    _sum: { totalAmount: true },
                });
                return {
                    stats: {
                        totalUsers,
                        totalTutors,
                        totalStudents,
                        totalBookings,
                        totalRevenue: totalRevenue._sum.totalAmount || 0,
                    },
                };
            }
        }
        catch (error) {
            console.error('Dashboard error:', error);
            throw new Error(error.message || 'Failed to load dashboard');
        }
    }
    // USER STATS 
    static async getUserStats(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                tutorProfile: true,
            },
        });
        if (!user)
            throw new Error('User not found');
        if (user.role === 'STUDENT') {
            const bookings = await database_1.default.booking.findMany({
                where: { studentId: userId },
                include: { review: true },
            });
            const completed = bookings.filter(b => b.status === 'COMPLETED');
            const reviewsWithRatings = completed.filter(b => b.review);
            const averageRating = reviewsWithRatings.length > 0
                ? reviewsWithRatings.reduce((sum, b) => sum + (b.review?.rating || 0), 0) / reviewsWithRatings.length
                : 0;
            return {
                role: 'STUDENT',
                totalBookings: bookings.length,
                completedBookings: completed.length,
                totalSpent: completed.reduce((s, b) => s + b.totalAmount, 0),
                averageRating: parseFloat(averageRating.toFixed(1)),
            };
        }
        if (user.role === 'TUTOR') {
            const bookings = await database_1.default.booking.findMany({
                where: { tutorId: userId },
                include: { review: true },
            });
            const completed = bookings.filter(b => b.status === 'COMPLETED');
            const reviewsWithRatings = completed.filter(b => b.review);
            const averageRating = reviewsWithRatings.length > 0
                ? reviewsWithRatings.reduce((sum, b) => sum + (b.review?.rating || 0), 0) / reviewsWithRatings.length
                : user.tutorProfile?.rating || 0;
            return {
                role: 'TUTOR',
                totalBookings: bookings.length,
                completedBookings: completed.length,
                totalEarnings: completed.reduce((s, b) => s + b.totalAmount, 0),
                averageRating: parseFloat(averageRating.toFixed(1)),
            };
        }
        return { role: 'ADMIN' };
    }
    // BOOKING HISTORY 
    static async getBookingHistory(userId, role) {
        const where = role === 'STUDENT'
            ? { studentId: userId }
            : { tutorId: userId };
        const bookings = await database_1.default.booking.findMany({
            where,
            include: {
                student: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    },
                },
                tutor: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        tutorProfile: {
                            select: {
                                title: true,
                            },
                        },
                    },
                },
                review: true,
            },
            orderBy: { date: 'desc' },
        });
        const now = new Date();
        return {
            upcoming: bookings.filter(b => new Date(b.date) > now && b.status === 'CONFIRMED'),
            past: bookings.filter(b => new Date(b.date) <= now || b.status !== 'CONFIRMED'),
            all: bookings,
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=userService.js.map