import { Request, Response } from 'express';
import { PaymentService } from '../services/paymentService';
import { AuthRequest } from '../middleware/auth';

export class PaymentController {
  // Create payment intent for booking
  static async createPaymentIntent(req: AuthRequest, res: Response) {
    try {
      const { bookingId } = req.body;
      
      if (!bookingId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID is required',
        });
      }

      const result = await PaymentService.createPaymentIntent(bookingId);
      
      res.json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error creating payment intent:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }

  // Confirm payment after successful charge 
  static async confirmPayment(req: AuthRequest, res: Response) {
    try {
      const { bookingId, paymentIntentId } = req.body;
      
      if (!bookingId || !paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: 'Booking ID and Payment Intent ID are required',
        });
      }

      const booking = await PaymentService.confirmPayment(bookingId, paymentIntentId);
      
      res.json({
        success: true,
        message: 'Payment successful!',
        data: booking,
      });
    } catch (error: any) {
      console.error('Error confirming payment:', error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
}