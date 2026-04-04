import { Response } from 'express';
import { UserService } from '../services/userService';
import { AuthRequest } from '../middleware/auth';

export class UserController {

  // GET DASHBOARD
  static async getDashboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const role = req.user!.role;

      const data = await UserService.getDashboardData(userId, role);

      return res.json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error('Dashboard error:', error);

      return res.status(500).json({
        message: error.message || 'Error loading dashboard',
      });
    }
  }

  // GET USER STATS
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

      if (error.message === 'User not found') {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: error.message || 'Error fetching stats',
      });
    }
  }

  // GET BOOKING HISTORY
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
        message: error.message || 'Error fetching booking history',
      });
    }
  }
}