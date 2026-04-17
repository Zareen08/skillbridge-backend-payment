"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorService = void 0;
const database_1 = __importDefault(require("../config/database"));
const types_1 = require("../types");
class TutorService {
    static async getAllTutors(filters = {}) {
        try {
            const where = types_1.FilterBuilder.buildTutorWhere(filters);
            const orderBy = types_1.FilterBuilder.buildTutorOrderBy(filters);
            const tutors = await database_1.default.tutorProfile.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            isActive: true,
                        }
                    }
                },
                orderBy,
            });
            // Filter active tutors and apply search
            let filteredTutors = tutors.filter(tutor => tutor.user !== null && tutor.user.isActive === true);
            if (filters.search && filters.search.trim()) {
                const searchLower = filters.search.toLowerCase().trim();
                filteredTutors = filteredTutors.filter(tutor => {
                    const titleMatch = (tutor.title || '').toLowerCase().includes(searchLower);
                    const bioMatch = (tutor.bio || '').toLowerCase().includes(searchLower);
                    const nameMatch = (tutor.user?.name || '').toLowerCase().includes(searchLower);
                    const subjectMatch = (tutor.subjects || []).some(s => s.toLowerCase().includes(searchLower));
                    return titleMatch || bioMatch || nameMatch || subjectMatch;
                });
            }
            // Apply pagination if provided
            if (filters.page && filters.limit) {
                const { skip, take } = types_1.FilterBuilder.getPagination(filters.page, filters.limit);
                filteredTutors = filteredTutors.slice(skip, skip + take);
            }
            return filteredTutors;
        }
        catch (error) {
            console.error('Error in getAllTutors:', error);
            throw new Error('Failed to fetch tutors');
        }
    }
    static async getTutorById(tutorId) {
        try {
            // First, try to find by tutor profile ID
            let tutor = await database_1.default.tutorProfile.findUnique({
                where: { id: tutorId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            isActive: true,
                        }
                    }
                }
            });
            // If not found by profile ID, try to find by user ID
            if (!tutor) {
                tutor = await database_1.default.tutorProfile.findUnique({
                    where: { userId: tutorId },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                avatar: true,
                                isActive: true,
                            }
                        }
                    }
                });
            }
            if (!tutor) {
                throw new types_1.NotFoundError('Tutor');
            }
            if (!tutor.user) {
                throw new types_1.NotFoundError('Tutor user account');
            }
            if (!tutor.user.isActive) {
                throw new Error('Tutor account is inactive');
            }
            // Get reviews
            const reviews = await database_1.default.review.findMany({
                where: { tutorId: tutor.userId },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            email: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            // Cast reviews to ReviewWithStudent type
            const typedReviews = reviews.map(review => ({
                ...review,
                student: {
                    id: review.student.id,
                    name: review.student.name,
                    avatar: review.student.avatar,
                    email: review.student.email
                }
            }));
            // Get tutor stats
            const stats = await database_1.default.booking.aggregate({
                where: {
                    tutorId: tutor.userId,
                    status: 'COMPLETED',
                },
                _count: true,
                _sum: {
                    totalAmount: true,
                },
            });
            return {
                ...tutor,
                reviews: typedReviews,
                stats: {
                    totalCompletedSessions: stats._count || 0,
                    totalEarnings: stats._sum?.totalAmount || 0,
                }
            };
        }
        catch (error) {
            console.error('Error in getTutorById:', error);
            throw error;
        }
    }
    // ✅ NEW: Get tutor profile by user ID
    static async getTutorProfileByUserId(userId) {
        try {
            const profile = await database_1.default.tutorProfile.findUnique({
                where: { userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        }
                    }
                }
            });
            if (!profile) {
                throw new Error('Tutor profile not found');
            }
            return profile;
        }
        catch (error) {
            console.error('Error in getTutorProfileByUserId:', error);
            throw error;
        }
    }
    // ✅ NEW: Get featured tutors
    static async getFeaturedTutors(limit) {
        try {
            const tutors = await database_1.default.tutorProfile.findMany({
                where: {
                    rating: { gte: 4.5 },
                    user: { isActive: true },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            email: true,
                        }
                    }
                },
                take: limit,
                orderBy: { rating: 'desc' },
            });
            return tutors;
        }
        catch (error) {
            console.error('Error in getFeaturedTutors:', error);
            throw new Error('Failed to fetch featured tutors');
        }
    }
    // ✅ NEW: Get top rated tutors
    static async getTopRated(limit) {
        try {
            const tutors = await database_1.default.tutorProfile.findMany({
                where: {
                    rating: { gt: 0 },
                    user: { isActive: true },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            email: true,
                        }
                    }
                },
                take: limit,
                orderBy: { rating: 'desc' },
            });
            return tutors;
        }
        catch (error) {
            console.error('Error in getTopRated:', error);
            throw new Error('Failed to fetch top rated tutors');
        }
    }
    // ✅ NEW: Search tutors by subject
    static async searchBySubject(subject) {
        try {
            const tutors = await database_1.default.tutorProfile.findMany({
                where: {
                    subjects: { has: subject },
                    user: { isActive: true },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                            email: true,
                        }
                    }
                },
                orderBy: { rating: 'desc' },
            });
            return tutors;
        }
        catch (error) {
            console.error('Error in searchBySubject:', error);
            throw new Error('Failed to search tutors');
        }
    }
    // ✅ NEW: Get tutor availability
    static async getAvailability(userId) {
        try {
            const profile = await database_1.default.tutorProfile.findUnique({
                where: { userId },
                select: { availability: true }
            });
            return profile?.availability || {};
        }
        catch (error) {
            console.error('Error in getAvailability:', error);
            throw new Error('Failed to fetch availability');
        }
    }
    static async updateProfile(userId, data) {
        try {
            // Check if tutor profile exists
            const existingProfile = await database_1.default.tutorProfile.findUnique({
                where: { userId }
            });
            if (!existingProfile) {
                throw new types_1.NotFoundError('Tutor profile');
            }
            const updatedProfile = await database_1.default.tutorProfile.update({
                where: { userId },
                data: {
                    ...(data.title !== undefined && { title: data.title }),
                    ...(data.bio !== undefined && { bio: data.bio }),
                    ...(data.subjects !== undefined && { subjects: data.subjects }),
                    ...(data.hourlyRate !== undefined && { hourlyRate: data.hourlyRate }),
                    ...(data.experience !== undefined && { experience: data.experience }),
                    ...(data.education !== undefined && { education: data.education }),
                    ...(data.availability !== undefined && { availability: data.availability }),
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        }
                    }
                }
            });
            return updatedProfile;
        }
        catch (error) {
            console.error('Error in updateProfile:', error);
            throw error;
        }
    }
    static async updateAvailability(userId, availability) {
        try {
            const updatedProfile = await database_1.default.tutorProfile.update({
                where: { userId },
                data: { availability },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        }
                    }
                }
            });
            return updatedProfile;
        }
        catch (error) {
            console.error('Error in updateAvailability:', error);
            throw error;
        }
    }
    static async getTutorBookings(tutorId) {
        try {
            const bookings = await database_1.default.booking.findMany({
                where: { tutorId },
                include: {
                    student: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        }
                    },
                    review: true,
                },
                orderBy: { date: 'desc' }
            });
            const now = new Date();
            const upcoming = bookings.filter(booking => new Date(booking.date) > now && booking.status === 'CONFIRMED');
            const past = bookings.filter(booking => new Date(booking.date) <= now || booking.status !== 'CONFIRMED');
            return {
                all: bookings,
                upcoming,
                past,
                total: bookings.length,
                completed: bookings.filter(b => b.status === 'COMPLETED').length,
                cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
            };
        }
        catch (error) {
            console.error('Error in getTutorBookings:', error);
            throw error;
        }
    }
    static async getTutorStats(tutorId) {
        try {
            const [profile, bookings, reviews] = await Promise.all([
                database_1.default.tutorProfile.findUnique({
                    where: { userId: tutorId },
                }),
                database_1.default.booking.findMany({
                    where: { tutorId },
                }),
                database_1.default.review.findMany({
                    where: { tutorId },
                }),
            ]);
            const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
            const totalEarnings = completedBookings.reduce((sum, b) => sum + b.totalAmount, 0);
            const averageRating = reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;
            return {
                totalBookings: bookings.length,
                completedBookings: completedBookings.length,
                cancelledBookings: bookings.filter(b => b.status === 'CANCELLED').length,
                totalEarnings,
                averageRating,
                totalReviews: reviews.length,
                totalStudents: new Set(bookings.map(b => b.studentId)).size,
                profile: {
                    title: profile?.title || null,
                    hourlyRate: profile?.hourlyRate || null,
                    rating: profile?.rating || null,
                    totalReviews: profile?.totalReviews || null,
                }
            };
        }
        catch (error) {
            console.error('Error in getTutorStats:', error);
            throw error;
        }
    }
}
exports.TutorService = TutorService;
//# sourceMappingURL=tutorService.js.map