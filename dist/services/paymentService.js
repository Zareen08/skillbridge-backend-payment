"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const database_1 = __importDefault(require("../config/database"));
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2026-03-25.dahlia',
});
class PaymentService {
    // Create payment intent for booking
    static async createPaymentIntent(bookingId) {
        try {
            const booking = await database_1.default.booking.findUnique({
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
            // (prevents duplicate payment records if user refreshes the payment page)
            const existingPayment = await database_1.default.payment.findUnique({
                where: { bookingId: booking.id },
            });
            if (existingPayment) {
                // Reuse the existing payment intent instead of creating a new one
                const existingIntent = await stripe.paymentIntents.retrieve(existingPayment.paymentIntentId);
                // Only reuse if it's still in a usable state
                if (existingIntent.status === 'requires_payment_method' ||
                    existingIntent.status === 'requires_confirmation' ||
                    existingIntent.status === 'requires_action') {
                    return { clientSecret: existingIntent.client_secret };
                }
            }
            // Create payment intent
            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(booking.totalAmount * 100),
                currency: 'usd',
                metadata: {
                    bookingId: booking.id,
                    studentId: booking.studentId,
                    tutorId: booking.tutorId,
                },
            });
            // Save payment record
            await database_1.default.payment.create({
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
        }
        catch (error) {
            console.error('Error creating payment intent:', error);
            throw error;
        }
    }
    // Confirm payment after successful charge
    static async confirmPayment(bookingId, paymentIntentId) {
        try {
            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
            if (paymentIntent.status !== 'succeeded') {
                throw new Error('Payment not successful');
            }
            await database_1.default.payment.update({
                where: { paymentIntentId },
                data: { status: 'succeeded' },
            });
            // Update booking from PENDING_PAYMENT to CONFIRMED
            const booking = await database_1.default.booking.update({
                where: { id: bookingId },
                data: {
                    status: 'CONFIRMED',
                    paymentStatus: 'paid',
                },
            });
            return booking;
        }
        catch (error) {
            console.error('Error confirming payment:', error);
            throw error;
        }
    }
}
exports.PaymentService = PaymentService;
//# sourceMappingURL=paymentService.js.map