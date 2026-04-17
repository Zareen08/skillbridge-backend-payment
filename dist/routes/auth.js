"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Register
router.post('/register', authController_1.AuthController.register);
// Login
router.post('/login', authController_1.AuthController.login);
// Get current user
router.get('/me', auth_1.authMiddleware, authController_1.AuthController.getMe);
exports.default = router;
//# sourceMappingURL=auth.js.map