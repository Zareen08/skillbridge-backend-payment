"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const paymentController_1 = require("../controllers/paymentController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Protected routes
router.post('/create-payment-intent', auth_1.authMiddleware, paymentController_1.PaymentController.createPaymentIntent);
router.post('/confirm-payment', auth_1.authMiddleware, paymentController_1.PaymentController.confirmPayment);
exports.default = router;
//# sourceMappingURL=payment.js.map