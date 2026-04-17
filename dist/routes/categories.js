"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categoryController_1 = require("../controllers/categoryController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all categories
router.get('/', categoryController_1.CategoryController.getAllCategories);
router.get('/search', categoryController_1.CategoryController.searchCategories);
router.get('/popular', categoryController_1.CategoryController.getPopularCategories);
router.get('/stats', categoryController_1.CategoryController.getStats);
router.get('/:id', categoryController_1.CategoryController.getCategoryById);
// Admin Routes
router.post('/', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('ADMIN'), categoryController_1.CategoryController.createCategory);
router.patch('/:id', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('ADMIN'), categoryController_1.CategoryController.updateCategory);
router.delete('/:id', auth_1.authMiddleware, (0, auth_1.roleMiddleware)('ADMIN'), categoryController_1.CategoryController.deleteCategory);
exports.default = router;
//# sourceMappingURL=categories.js.map