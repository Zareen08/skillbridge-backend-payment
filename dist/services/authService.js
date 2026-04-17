"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = __importDefault(require("../config/database"));
const bcrypt_1 = require("../utils/bcrypt");
const jwt_1 = require("../utils/jwt");
class AuthService {
    static async register(data) {
        // Check if user exists
        const existingUser = await database_1.default.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser) {
            throw new Error('User already exists');
        }
        // Hash password
        const hashedPassword = await (0, bcrypt_1.hashPassword)(data.password);
        // Create user
        const user = await database_1.default.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                name: data.name,
                role: data.role,
            }
        });
        // Create role-specific profile
        if (data.role === 'STUDENT') {
            await database_1.default.studentProfile.create({
                data: {
                    userId: user.id,
                    phone: data.phone,
                    education: data.education,
                    interests: data.interests || [],
                }
            });
        }
        else if (data.role === 'TUTOR') {
            await database_1.default.tutorProfile.create({
                data: {
                    userId: user.id,
                    title: '',
                    bio: '',
                    subjects: [],
                    hourlyRate: 0,
                    experience: 0,
                    education: '',
                }
            });
        }
        // Generate JWT payload
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        // Generate token
        const token = (0, jwt_1.generateToken)(payload);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
        };
    }
    static async login(email, password) {
        const user = await database_1.default.user.findUnique({
            where: { email },
            include: {
                studentProfile: true,
                tutorProfile: true,
            }
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        if (!user.isActive) {
            throw new Error('Account is banned');
        }
        const isValid = await (0, bcrypt_1.comparePassword)(password, user.password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }
        // Generate JWT payload
        const payload = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        };
        // Generate token
        const token = (0, jwt_1.generateToken)(payload);
        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                profile: user.studentProfile || user.tutorProfile,
            }
        };
    }
    static async getCurrentUser(userId) {
        const user = await database_1.default.user.findUnique({
            where: { id: userId },
            include: {
                studentProfile: true,
                tutorProfile: true,
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            avatar: user.avatar,
            profile: user.studentProfile || user.tutorProfile,
        };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=authService.js.map