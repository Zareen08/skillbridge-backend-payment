"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const globalForPrisma = global;
const prisma = globalForPrisma.prisma || new client_1.PrismaClient({
    log: process.env.NODE_ENV === 'production'
        ? ['error']
        : ['error', 'warn'],
});
if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
exports.default = prisma;
//# sourceMappingURL=database.js.map