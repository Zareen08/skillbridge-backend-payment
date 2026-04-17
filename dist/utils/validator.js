"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tutorProfileValidation = exports.reviewValidation = exports.bookingValidation = exports.loginValidation = exports.registerValidation = exports.validate = void 0;
const express_validator_1 = require("express-validator");
const validate = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};
exports.validate = validate;
exports.registerValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('name').notEmpty().trim(),
    (0, express_validator_1.body)('role').isIn(['STUDENT', 'TUTOR']),
];
exports.loginValidation = [
    (0, express_validator_1.body)('email').isEmail().normalizeEmail(),
    (0, express_validator_1.body)('password').notEmpty(),
];
exports.bookingValidation = [
    (0, express_validator_1.body)('tutorId').notEmpty(),
    (0, express_validator_1.body)('date').isISO8601(),
    (0, express_validator_1.body)('duration').isInt({ min: 30, max: 480 }),
];
exports.reviewValidation = [
    (0, express_validator_1.body)('rating').isInt({ min: 1, max: 5 }),
    (0, express_validator_1.body)('comment').notEmpty().trim(),
    (0, express_validator_1.body)('bookingId').notEmpty(),
];
exports.tutorProfileValidation = [
    (0, express_validator_1.body)('title').optional().notEmpty(),
    (0, express_validator_1.body)('hourlyRate').optional().isFloat({ min: 0 }),
    (0, express_validator_1.body)('experience').optional().isInt({ min: 0 }),
    (0, express_validator_1.body)('subjects').optional().isArray(),
];
//# sourceMappingURL=validator.js.map