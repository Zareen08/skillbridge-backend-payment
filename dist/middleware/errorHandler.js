"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
    // Prisma error handling
    if (err.code === 'P2002') {
        return res.status(400).json({
            message: 'Duplicate field value',
            field: err.meta?.target
        });
    }
    if (err.code === 'P2025') {
        return res.status(404).json({ message: 'Record not found' });
    }
    if (err.code === 'P2003') {
        return res.status(400).json({ message: 'Foreign key constraint failed' });
    }
    // JWT error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    // Default error
    const status = err.status || 500;
    const message = err.message || 'Internal server error';
    res.status(status).json({ message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map