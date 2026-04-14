import { Response } from 'express';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';

export class UserController {

  // GET DASHBOARD - /api/users/dashboard
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      const data = await UserService.getDashboardData(userId, role);

      return res.json({
        success: true,
        data: data,
      });
    } catch (error: any) {
      console.error('Dashboard error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error loading dashboard',
      });
    }
  }

  // GET USER STATS - /api/users/stats
  static async getUserStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await UserService.getUserStats(userId);

      return res.json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error('Stats error:', error);
      
      const status = error.message === 'User not found' ? 404 : 500;
      return res.status(status).json({
        success: false,
        message: error.message || 'Error fetching stats',
      });
    }
  }

  // GET BOOKING HISTORY - /api/users/bookings
  static async getBookingHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;
      const bookings = await UserService.getBookingHistory(userId, role);

      return res.json({
        success: true,
        data: bookings,
      });
    } catch (error: any) {
      console.error('Booking history error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching booking history',
      });
    }
  }

  // GET PROFILE - /api/users/profile
  static async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      
      const user = await prisma.user.findUnique({
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
    } catch (error: any) {
      console.error('Profile error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error fetching profile',
      });
    }
  }

  // UPDATE PROFILE - /api/users/profile
  static async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, avatar, phone, education, interests } = req.body;

      // Update user
      const user = await prisma.user.update({
        where: { id: userId },
        data: { 
          ...(name && { name }),
          ...(avatar && { avatar }),
        },
      });

      // Update student profile if exists
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { userId },
      });

      if (studentProfile) {
        await prisma.studentProfile.update({
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
    } catch (error: any) {
      console.error('Update profile error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Error updating profile',
      });
    }
  }
}