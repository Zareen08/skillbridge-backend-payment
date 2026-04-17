"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorController = void 0;
const database_1 = __importDefault(require("../config/database"));
const tutorService_1 = require("../services/tutorService");
class TutorController {
    static async getAllTutors(req, res) {
        try {
            const filters = {
                subject: req.query.subject,
                minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
                maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
                search: req.query.search,
                page: req.query.page ? Number(req.query.page) : undefined,
                limit: req.query.limit ? Number(req.query.limit) : undefined,
                sortBy: req.query.sortBy,
                sortOrder: req.query.sortOrder,
            };
            const tutors = await tutorService_1.TutorService.getAllTutors(filters);
            res.json({
                success: true,
                data: tutors,
                count: tutors.length,
            });
        }
        catch (error) {
            console.error('Error in getAllTutors:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch tutors',
            });
        }
    }
    static async getTutorById(req, res) {
        try {
            const id = String(req.params.id);
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Tutor ID is required',
                });
            }
            const tutor = await tutorService_1.TutorService.getTutorById(id);
            res.json({
                success: true,
                data: tutor,
            });
        }
        catch (error) {
            if (error.message === 'Tutor not found') {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor not found',
                });
            }
            if (error.message === 'Tutor account is inactive') {
                return res.status(403).json({
                    success: false,
                    message: 'Tutor account is inactive',
                });
            }
            console.error('Error in getTutorById:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch tutor',
            });
        }
    }
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const data = req.body;
            if (data.hourlyRate !== undefined && data.hourlyRate < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Hourly rate cannot be negative',
                });
            }
            if (data.experience !== undefined && data.experience < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Experience cannot be negative',
                });
            }
            const profile = await tutorService_1.TutorService.updateProfile(userId, data);
            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: profile,
            });
        }
        catch (error) {
            console.error('Error in updateProfile:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update profile',
            });
        }
    }
    static async updateAvailability(req, res) {
        try {
            const userId = req.user.id;
            const { availability } = req.body;
            if (!availability || typeof availability !== 'object') {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid availability format. Availability must be an object.',
                });
            }
            const profile = await tutorService_1.TutorService.updateAvailability(userId, availability);
            res.json({
                success: true,
                message: 'Availability updated successfully',
                data: profile,
            });
        }
        catch (error) {
            console.error('Error in updateAvailability:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update availability',
            });
        }
    }
    static async getMyBookings(req, res) {
        try {
            const userId = req.user.id;
            const bookings = await tutorService_1.TutorService.getTutorBookings(userId);
            res.json({
                success: true,
                data: bookings,
            });
        }
        catch (error) {
            console.error('Error in getMyBookings:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch bookings',
            });
        }
    }
    static async getMyStats(req, res) {
        try {
            const stats = await tutorService_1.TutorService.getTutorStats(req.user.id);
            res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error('Error in getMyStats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch stats',
            });
        }
    }
    static async getFeaturedTutors(req, res) {
        try {
            const limit = Number(req.query.limit) || 6;
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
                            email: true
                        },
                    },
                },
                take: limit,
                orderBy: { rating: 'desc' },
            });
            res.json({
                success: true,
                data: tutors,
                count: tutors.length,
            });
        }
        catch (error) {
            console.error('Error in getFeaturedTutors:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch featured tutors',
            });
        }
    }
    static async getTopRated(req, res) {
        try {
            const limit = Number(req.query.limit) || 10;
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
                            email: true
                        },
                    },
                },
                take: limit,
                orderBy: { rating: 'desc' },
            });
            res.json({
                success: true,
                data: tutors,
                count: tutors.length,
            });
        }
        catch (error) {
            console.error('Error in getTopRated:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch top rated tutors',
            });
        }
    }
    static async searchBySubject(req, res) {
        try {
            const subject = String(req.params.subject);
            if (!subject || subject.trim() === '') {
                return res.status(400).json({
                    success: false,
                    message: 'Subject is required',
                });
            }
            const tutors = await database_1.default.tutorProfile.findMany({
                where: {
                    subjects: {
                        has: subject,
                    },
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
                            email: true
                        },
                    },
                },
                orderBy: { rating: 'desc' },
            });
            res.json({
                success: true,
                data: tutors,
                count: tutors.length,
                subject: subject,
            });
        }
        catch (error) {
            console.error('Error in searchBySubject:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to search tutors',
            });
        }
    }
    static async getMyProfile(req, res) {
        try {
            const userId = req.user.id;
            const tutor = await database_1.default.tutorProfile.findUnique({
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
            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor profile not found',
                });
            }
            res.json({
                success: true,
                data: tutor,
            });
        }
        catch (error) {
            console.error('Error in getMyProfile:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch profile',
            });
        }
    }
    static async getMyAvailability(req, res) {
        try {
            const userId = req.user.id;
            const tutor = await database_1.default.tutorProfile.findUnique({
                where: { userId },
                select: {
                    availability: true,
                    title: true,
                    hourlyRate: true,
                    subjects: true,
                }
            });
            if (!tutor) {
                return res.status(404).json({
                    success: false,
                    message: 'Tutor profile not found',
                });
            }
            res.json({
                success: true,
                data: {
                    availability: tutor.availability || {},
                    title: tutor.title,
                    hourlyRate: tutor.hourlyRate,
                    subjects: tutor.subjects,
                }
            });
        }
        catch (error) {
            console.error('Error in getMyAvailability:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch availability',
            });
        }
    }
}
exports.TutorController = TutorController;
//# sourceMappingURL=tutorController.js.map