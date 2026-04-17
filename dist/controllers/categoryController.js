"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryController = void 0;
const categoryService_1 = require("../services/categoryService");
class CategoryController {
    // GET /categories
    static async getAllCategories(req, res) {
        try {
            const categories = await categoryService_1.CategoryService.getAllCategories();
            return res.status(200).json({
                success: true,
                data: categories,
            });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // GET categories/:id
    static async getCategoryById(req, res) {
        try {
            const { id } = req.params;
            // Validation Guard
            if (!id) {
                return res.status(400).json({ success: false, message: 'Category ID is required' });
            }
            const category = await categoryService_1.CategoryService.getCategoryById(id);
            return res.status(200).json({
                success: true,
                data: category,
            });
        }
        catch (error) {
            const status = error.message === 'Category not found' ? 404 : 500;
            return res.status(status).json({ success: false, message: error.message });
        }
    }
    // GET categories/search?q=...
    static async searchCategories(req, res) {
        try {
            const searchTerm = req.query.q;
            if (!searchTerm) {
                return res.status(400).json({ success: false, message: 'Search term is required' });
            }
            const categories = await categoryService_1.CategoryService.searchCategories(searchTerm);
            return res.status(200).json({ success: true, data: categories });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    // POST categories (Admin Only)
    static async createCategory(req, res) {
        try {
            const category = await categoryService_1.CategoryService.createCategory(req.body);
            return res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category,
            });
        }
        catch (error) {
            const status = error.message === 'Category already exists' ? 400 : 500;
            return res.status(status).json({ success: false, message: error.message });
        }
    }
    // PATCH categories/:id (Admin Only)
    static async updateCategory(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'Category ID is required' });
            }
            const updatedCategory = await categoryService_1.CategoryService.updateCategory(id, req.body);
            return res.status(200).json({
                success: true,
                message: 'Category updated successfully',
                data: updatedCategory,
            });
        }
        catch (error) {
            const status = error.message === 'Category not found' ? 404 : 400;
            return res.status(status).json({ success: false, message: error.message });
        }
    }
    // DELETE categories/:id (Admin Only)
    static async deleteCategory(req, res) {
        try {
            const { id } = req.params;
            if (!id) {
                return res.status(400).json({ success: false, message: 'Category ID is required' });
            }
            const result = await categoryService_1.CategoryService.deleteCategory(id);
            return res.status(200).json({
                success: true,
                message: result.message,
            });
        }
        catch (error) {
            const status = error.message.includes('tutors') ? 400 : 404;
            return res.status(status).json({ success: false, message: error.message });
        }
    }
    //GET categories popular
    static async getPopularCategories(req, res) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit) : 6;
            const categories = await categoryService_1.CategoryService.getPopularCategories(limit);
            return res.status(200).json({ success: true, data: categories });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
    //GET categories stats (Admin)
    static async getStats(req, res) {
        try {
            const stats = await categoryService_1.CategoryService.getCategoryStats();
            return res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message });
        }
    }
}
exports.CategoryController = CategoryController;
//# sourceMappingURL=categoryController.js.map