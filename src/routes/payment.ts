import { Router } from 'express';
import { PaymentController } from '../controllers/paymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Protected routes
router.post('/create-payment-intent', authMiddleware, PaymentController.createPaymentIntent);
router.post('/confirm-payment', authMiddleware, PaymentController.confirmPayment);

export default router;