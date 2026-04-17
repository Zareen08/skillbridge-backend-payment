"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const authService_1 = require("../services/authService");
class AuthController {
    static async register(req, res) {
        try {
            const result = await authService_1.AuthService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                ...result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    }
    static async login(req, res) {
        try {
            const { email, password } = req.body;
            const result = await authService_1.AuthService.login(email, password);
            res.json({
                success: true,
                message: 'Login successful',
                ...result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                message: error.message
            });
        }
    }
    static async getMe(req, res) {
        try {
            const user = await authService_1.AuthService.getCurrentUser(req.user.id);
            res.json({
                success: true,
                user
            });
        }
        catch (error) {
            res.status(404).json({
                success: false,
                message: error.message
            });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=authController.js.map