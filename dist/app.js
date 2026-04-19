"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const tutors_1 = __importDefault(require("./routes/tutors"));
const bookings_1 = __importDefault(require("./routes/bookings"));
const reviews_1 = __importDefault(require("./routes/reviews"));
const categories_1 = __importDefault(require("./routes/categories"));
const admin_1 = __importDefault(require("./routes/admin"));
const payment_1 = __importDefault(require("./routes/payment"));
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const allowedOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
    : ['http://localhost:3000', 'http://localhost:3001', 'https://skillbridge-frontend-payment.onrender.com', '/\\.vercel\\.app$/'];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin))
            return callback(null, true);
        console.log(`CORS blocked: ${origin}`);
        callback(new Error(`CORS policy: origin "${origin}" is not allowed`));
    },
    credentials: true,
}));
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request logging
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});
// Health check
app.get('/health', (_req, res) => {
    res.json({
        success: true,
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
    });
});
// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        success: true,
        message: 'SkillBridge API Server',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            users: '/api/users',
            tutors: '/api/tutors',
            bookings: '/api/bookings',
            reviews: '/api/reviews',
            categories: '/api/categories',
            admin: '/api/admin',
            payments: '/api/payments',
        },
    });
});
// API Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/tutors', tutors_1.default);
app.use('/api/bookings', bookings_1.default);
app.use('/api/reviews', reviews_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/admin', admin_1.default);
app.use('/api/payments', payment_1.default);
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.method} ${req.url} not found`,
    });
});
// Global error handler
app.use(errorHandler_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map