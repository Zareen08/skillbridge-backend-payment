"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const adminService_1 = require("../services/adminService");
class AdminController {
    // Dashboard  
    static async getDashboardStats(req, res) {
        try {
            const stats = await adminService_1.AdminService.getDashboardStats();
            res.status(200).json({
                success: true,
                message: 'Dashboard statistics fetched successfully',
                data: stats,
            });
        }
        catch (error) {
            console.error('Error in getDashboardStats:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch dashboard statistics',
            });
        }
    }
    // User Management  
    static async getAllUsers(req, res) {
        try {
            const { role, search, isActive, page, limit, sortBy, sortOrder, } = req.query;
            const result = await adminService_1.AdminService.getAllUsers({
                role: typeof role === 'string' ? role : undefined,
                search: typeof search === 'string' ? search : undefined,
                isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sortBy: typeof sortBy === 'string' ? sortBy : 'createdAt',
                sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
            });
            res.status(200).json({
                success: true,
                message: 'Users fetched successfully',
                data: result,
            });
        }
        catch (error) {
            console.error('Error in getAllUsers:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch users',
            });
        }
    }
    static async getUserDetails(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                });
            }
            const user = await adminService_1.AdminService.getUserDetails(id);
            res.status(200).json({
                success: true,
                message: 'User details fetched successfully',
                data: user,
            });
        }
        catch (error) {
            console.error('Error in getUserDetails:', error);
            const status = error.message === 'User not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to fetch user details',
            });
        }
    }
    static async updateUserStatus(req, res) {
        try {
            const id = req.params.id;
            const { isActive, reason } = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                });
            }
            if (typeof isActive !== 'boolean') {
                return res.status(400).json({
                    success: false,
                    message: 'isActive must be a boolean',
                });
            }
            const user = await adminService_1.AdminService.updateUserStatus(id, isActive, reason);
            res.status(200).json({
                success: true,
                message: `User ${isActive ? 'activated' : 'banned'} successfully`,
                data: user,
            });
        }
        catch (error) {
            console.error('Error in updateUserStatus:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to update user status',
            });
        }
    }
    static async deleteUser(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'User ID is required',
                });
            }
            const result = await adminService_1.AdminService.deleteUser(id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            console.error('Error in deleteUser:', error);
            const status = error.message === 'User not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete user',
            });
        }
    }
    // Booking Management  
    static async getAllBookings(req, res) {
        try {
            const { status, search, startDate, endDate, page, limit, sortBy, sortOrder, } = req.query;
            const result = await adminService_1.AdminService.getAllBookings({
                status: typeof status === 'string' ? status : undefined,
                search: typeof search === 'string' ? search : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                page: page ? parseInt(page) : 1,
                limit: limit ? parseInt(limit) : 10,
                sortBy: typeof sortBy === 'string' ? sortBy : 'createdAt',
                sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
            });
            res.status(200).json({
                success: true,
                message: 'Bookings fetched successfully',
                data: result,
            });
        }
        catch (error) {
            console.error('Error in getAllBookings:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch bookings',
            });
        }
    }
    static async getBookingDetails(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required',
                });
            }
            const booking = await adminService_1.AdminService.getBookingDetails(id);
            res.status(200).json({
                success: true,
                message: 'Booking details fetched successfully',
                data: booking,
            });
        }
        catch (error) {
            console.error('Error in getBookingDetails:', error);
            const status = error.message === 'Booking not found' ? 404 : 500;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to fetch booking details',
            });
        }
    }
    static async cancelBooking(req, res) {
        try {
            const id = req.params.id;
            const { reason } = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required',
                });
            }
            const booking = await adminService_1.AdminService.cancelBooking(id, reason || 'Cancelled by admin');
            res.status(200).json({
                success: true,
                message: 'Booking cancelled successfully',
                data: booking,
            });
        }
        catch (error) {
            console.error('Error in cancelBooking:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to cancel booking',
            });
        }
    }
    // Category Management  
    static async getAllCategories(req, res) {
        try {
            const categories = await adminService_1.AdminService.getAllCategories();
            res.status(200).json({
                success: true,
                message: 'Categories fetched successfully',
                count: categories.length,
                data: categories,
            });
        }
        catch (error) {
            console.error('Error in getAllCategories:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch categories',
            });
        }
    }
    static async createCategory(req, res) {
        try {
            const { name, description, icon } = req.body;
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name is required',
                });
            }
            const category = await adminService_1.AdminService.createCategory({
                name: name.trim(),
                description: description?.trim(),
                icon: icon?.trim(),
            });
            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category,
            });
        }
        catch (error) {
            console.error('Error in createCategory:', error);
            const status = error.message === 'Category already exists' ? 409 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to create category',
            });
        }
    }
    static async updateCategory(req, res) {
        try {
            const id = req.params.id;
            const { name, description, icon } = req.body;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Category ID is required',
                });
            }
            const category = await adminService_1.AdminService.updateCategory(id, {
                name: name?.trim(),
                description: description?.trim(),
                icon: icon?.trim(),
            });
            res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: category,
            });
        }
        catch (error) {
            console.error('Error in updateCategory:', error);
            res.status(400).json({
                success: false,
                message: error.message || 'Failed to update category',
            });
        }
    }
    static async deleteCategory(req, res) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(400).json({
                    success: false,
                    message: 'Category ID is required',
                });
            }
            const result = await adminService_1.AdminService.deleteCategory(id);
            res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            console.error('Error in deleteCategory:', error);
            const status = error.message === 'Category not found' ? 404 : 400;
            res.status(status).json({
                success: false,
                message: error.message || 'Failed to delete category',
            });
        }
    }
    // Analytics  
    static async getPlatformAnalytics(req, res) {
        try {
            const { startDate, endDate } = req.query;
            if (!startDate || !endDate) {
                return res.status(400).json({
                    success: false,
                    message: 'startDate and endDate are required',
                });
            }
            const analytics = await adminService_1.AdminService.getPlatformAnalytics(new Date(startDate), new Date(endDate));
            res.status(200).json({
                success: true,
                message: 'Platform analytics fetched successfully',
                data: analytics,
            });
        }
        catch (error) {
            console.error('Error in getPlatformAnalytics:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to fetch platform analytics',
            });
        }
    }
    // System Health  
    static async getSystemHealth(req, res) {
        try {
            const health = await adminService_1.AdminService.getSystemHealth();
            res.status(200).json({
                success: true,
                message: 'System health checked successfully',
                data: health,
            });
        }
        catch (error) {
            console.error('Error in getSystemHealth:', error);
            res.status(500).json({
                success: false,
                message: error.message || 'Failed to check system health',
            });
        }
    }
}
exports.AdminController = AdminController;
//# sourceMappingURL=adminController.js.map