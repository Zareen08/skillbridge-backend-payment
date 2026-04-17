"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reviewController_1 = require("../controllers/reviewController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authMiddleware);
// Create review (only student)
router.post('/', (0, auth_1.roleMiddleware)('STUDENT'), reviewController_1.ReviewController.createReview);
// Get tutor reviews
router.get('/tutor/:tutorId', reviewController_1.ReviewController.getTutorReviews);
exports.default = router;
//# sourceMappingURL=reviews.js.map