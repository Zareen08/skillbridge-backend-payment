import Stripe from 'stripe';
import prisma from '../config/database';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
});

export class PaymentService {
  static async createPaymentIntent(bookingId: string) {
    try {
      const booking = await prisma.booking.findUnique({
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

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(booking.totalAmount * 100),
        currency: 'usd',
        metadata: {
          bookingId: booking.id,
          studentId: booking.studentId,
          tutorId: booking.tutorId,
        },
      });

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: booking.totalAmount,
          currency: 'usd',
          status: 'pending',  
          paymentIntentId: paymentIntent.id,
        },
      });

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  }

  static async confirmPayment(bookingId: string, paymentIntentId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        throw new Error('Payment not successful');
      }

      // Update payment status to 'succeeded' 
      await prisma.payment.update({
        where: { paymentIntentId },
        data: { status: 'succeeded' },  
      });

      const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { 
          status: 'CONFIRMED',
          paymentStatus: 'paid'
        },
      });

      return booking;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  }
}