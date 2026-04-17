"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const PORT = process.env.PORT || 5000;
// Start server
if (process.env.NODE_ENV !== 'production') {
    const server = app_1.default.listen(PORT, () => {
        console.log(`\n${'='.repeat(60)}`);
        console.log(` SkillBridge Server Started Successfully!`);
        console.log(`${'='.repeat(60)}`);
        console.log(` URL: http://localhost:${PORT}`);
        console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(` Started at: ${new Date().toISOString()}`);
        console.log(`\n Available Endpoints:`);
        console.log(`    Auth:        http://localhost:${PORT}/api/auth`);
        console.log(`    Users:       http://localhost:${PORT}/api/users`);
        console.log(`    Tutors:     http://localhost:${PORT}/api/tutors`);
        console.log(`    Bookings:    http://localhost:${PORT}/api/bookings`);
        console.log(`    Reviews:     http://localhost:${PORT}/api/reviews`);
        console.log(`    Categories:  http://localhost:${PORT}/api/categories`);
        console.log(`    Admin:       http://localhost:${PORT}/api/admin`);
        console.log(`\n Health Check: http://localhost:${PORT}/health`);
        console.log(`${'='.repeat(60)}\n`);
    });
    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });
    process.on('SIGINT', () => {
        console.log('SIGINT signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });
}
exports.default = app_1.default;
//# sourceMappingURL=server.js.map