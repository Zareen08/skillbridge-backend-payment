"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConflictError = exports.ForbiddenError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.AppError = exports.FilterBuilder = void 0;
class FilterBuilder {
    static buildTutorWhere(filters) {
        const where = {};
        if (filters.subject) {
            where.subjects = { has: filters.subject };
        }
        if (filters.minRating !== undefined && filters.minRating !== null) {
            where.rating = { gte: filters.minRating };
        }
        if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
            where.hourlyRate = { lte: filters.maxPrice };
        }
        return where;
    }
    static buildTutorOrderBy(filters) {
        const sortBy = filters.sortBy || 'rating';
        const sortOrder = filters.sortOrder || 'desc';
        return { [sortBy]: sortOrder };
    }
    static buildBookingWhere(filters, userId, role) {
        const where = {};
        if (userId && role) {
            if (role === 'STUDENT') {
                where.studentId = userId;
            }
            else if (role === 'TUTOR') {
                where.tutorId = userId;
            }
        }
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.startDate || filters.endDate) {
            where.date = {};
            if (filters.startDate)
                where.date.gte = filters.startDate;
            if (filters.endDate)
                where.date.lte = filters.endDate;
        }
        if (filters.minAmount !== undefined && filters.minAmount !== null) {
            where.totalAmount = { gte: filters.minAmount };
        }
        if (filters.maxAmount !== undefined && filters.maxAmount !== null) {
            where.totalAmount = { ...where.totalAmount, lte: filters.maxAmount };
        }
        return where;
    }
    static buildUserWhere(filters) {
        const where = {};
        if (filters.role) {
            where.role = filters.role;
        }
        if (filters.isActive !== undefined && filters.isActive !== null) {
            where.isActive = filters.isActive;
        }
        if (filters.search && filters.search.trim()) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { email: { contains: filters.search, mode: 'insensitive' } },
            ];
        }
        return where;
    }
    static buildReviewWhere(filters, tutorId) {
        const where = {};
        if (tutorId) {
            where.tutorId = tutorId;
        }
        if (filters.rating) {
            where.rating = filters.rating;
        }
        if (filters.minRating !== undefined && filters.minRating !== null) {
            where.rating = { gte: filters.minRating };
        }
        if (filters.maxRating !== undefined && filters.maxRating !== null) {
            where.rating = { ...where.rating, lte: filters.maxRating };
        }
        return where;
    }
    static getPagination(page = 1, limit = 10) {
        const validPage = Math.max(1, page);
        const validLimit = Math.min(100, Math.max(1, limit));
        return {
            skip: (validPage - 1) * validLimit,
            take: validLimit,
        };
    }
    static getPaginationResponse(data, total, page, limit) {
        const totalPages = Math.ceil(total / limit);
        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1,
            },
        };
    }
}
exports.FilterBuilder = FilterBuilder;
class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(resource) {
        super(`${resource} not found`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class UnauthorizedError extends AppError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
    }
}
exports.UnauthorizedError = UnauthorizedError;
class ForbiddenError extends AppError {
    constructor(message = 'Forbidden') {
        super(message, 403);
    }
}
exports.ForbiddenError = ForbiddenError;
class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
//# sourceMappingURL=index.js.map