"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.verifyToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
    try {
        return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn });
    }
    catch (err) {
        console.error('JWT sign error:', err);
        throw new Error('Failed to generate JWT token');
    }
};
exports.generateToken = generateToken;
const verifyToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch (err) {
        console.error('JWT verify error:', err);
        throw new Error('Invalid or expired token');
    }
};
exports.verifyToken = verifyToken;
const decodeToken = (token) => {
    try {
        const decoded = jsonwebtoken_1.default.decode(token);
        return decoded;
    }
    catch (err) {
        console.error('JWT decode error:', err);
        return null;
    }
};
exports.decodeToken = decodeToken;
//# sourceMappingURL=jwt.js.map