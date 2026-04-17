"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const userService_1 = require("../services/userService");
const database_1 = __importDefault(require("../config/database"));
class UserController {
    // GET DASHBOARD - /api/users/dashboard
    static async getDashboard(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const data = await userService_1.UserService.getDashboardData(userId, role);
            return res.json({
                success: true,
                data: data,
            });
        }
        catch (error) {
            console.error('Dashboard error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error loading dashboard',
            });
        }
    }
    // GET USER STATS - /api/users/stats
    static async getUserStats(req, res) {
        try {
            const userId = req.user.id;
            const stats = await userService_1.UserService.getUserStats(userId);
            return res.json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            console.error('Stats error:', error);
            const status = error.message === 'User not found' ? 404 : 500;
            return res.status(status).json({
                success: false,
                message: error.message || 'Error fetching stats',
            });
        }
    }
    // GET BOOKING HISTORY - /api/users/bookings
    static async getBookingHistory(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const bookings = await userService_1.UserService.getBookingHistory(userId, role);
            return res.json({
                success: true,
                data: bookings,
            });
        }
        catch (error) {
            console.error('Booking history error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching booking history',
            });
        }
    }
    // GET PROFILE - /api/users/profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const user = await database_1.default.user.findUnique({
                where: { id: userId },
                include: {
                    studentProfile: true,
                    tutorProfile: true,
                },
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found',
                });
            }
            return res.json({
                success: true,
                data: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    avatar: user.avatar,
                    profile: user.studentProfile || user.tutorProfile,
                },
            });
        }
        catch (error) {
            console.error('Profile error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error fetching profile',
            });
        }
    }
    // UPDATE PROFILE - /api/users/profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const { name, avatar, phone, education, interests } = req.body;
            // Update user
            const user = await database_1.default.user.update({
                where: { id: userId },
                data: {
                    ...(name && { name }),
                    ...(avatar && { avatar }),
                },
            });
            // Update student profile if exists
            const studentProfile = await database_1.default.studentProfile.findUnique({
                where: { userId },
            });
            if (studentProfile) {
                await database_1.default.studentProfile.update({
                    where: { userId },
                    data: {
                        ...(phone !== undefined && { phone }),
                        ...(education !== undefined && { education }),
                        ...(interests !== undefined && { interests }),
                    },
                });
            }
            return res.json({
                success: true,
                message: 'Profile updated successfully',
                data: user,
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Error updating profile',
            });
        }
    }
}
exports.UserController = UserController;
//# sourceMappingURL=userController.js.map