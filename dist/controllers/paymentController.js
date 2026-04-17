"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentController = void 0;
const paymentService_1 = require("../services/paymentService");
class PaymentController {
    // Create payment intent for booking
    static async createPaymentIntent(req, res) {
        try {
            const { bookingId } = req.body;
            if (!bookingId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID is required',
                });
            }
            const result = await paymentService_1.PaymentService.createPaymentIntent(bookingId);
            res.json({
                success: true,
                data: result,
            });
        }
        catch (error) {
            console.error('Error creating payment intent:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
    // Confirm payment after successful charge 
    static async confirmPayment(req, res) {
        try {
            const { bookingId, paymentIntentId } = req.body;
            if (!bookingId || !paymentIntentId) {
                return res.status(400).json({
                    success: false,
                    message: 'Booking ID and Payment Intent ID are required',
                });
            }
            const booking = await paymentService_1.PaymentService.confirmPayment(bookingId, paymentIntentId);
            res.json({
                success: true,
                message: 'Payment successful!',
                data: booking,
            });
        }
        catch (error) {
            console.error('Error confirming payment:', error);
            res.status(500).json({
                success: false,
                message: error.message,
            });
        }
    }
}
exports.PaymentController = PaymentController;
//# sourceMappingURL=paymentController.js.map