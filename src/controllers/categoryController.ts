import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

export class CategoryController {
  // GET /categories
  static async getAllCategories(req: Request, res: Response) {
    try {
      const categories = await CategoryService.getAllCategories();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET categories/:id
  static async getCategoryById(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      // Validation Guard
      if (!id) {
        return res.status(400).json({ success: false, message: 'Category ID is required' });
      }

      const category = await CategoryService.getCategoryById(id);
      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error: any) {
      const status = error.message === 'Category not found' ? 404 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  // GET categories/search?q=...
  static async searchCategories(req: Request, res: Response) {
    try {
      const searchTerm = req.query.q as string;
      if (!searchTerm) {
        return res.status(400).json({ success: false, message: 'Search term is required' });
      }
      const categories = await CategoryService.searchCategories(searchTerm);
      return res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  // POST categories (Admin Only)
  static async createCategory(req: Request, res: Response) {
    try {
      const category = await CategoryService.createCategory(req.body);
      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error: any) {
      const status = error.message === 'Category already exists' ? 400 : 500;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  // PATCH categories/:id (Admin Only)
  static async updateCategory(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Category ID is required' });
      }

      const updatedCategory = await CategoryService.updateCategory(id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Category updated successfully',
        data: updatedCategory,
      });
    } catch (error: any) {
      const status = error.message === 'Category not found' ? 404 : 400;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  // DELETE categories/:id (Admin Only)
  static async deleteCategory(req: Request<{ id: string }>, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ success: false, message: 'Category ID is required' });
      }

      const result = await CategoryService.deleteCategory(id);
      return res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      const status = error.message.includes('tutors') ? 400 : 404;
      return res.status(status).json({ success: false, message: error.message });
    }
  }

  //GET categories popular
  static async getPopularCategories(req: Request, res: Response) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
      const categories = await CategoryService.getPopularCategories(limit);
      return res.status(200).json({ success: true, data: categories });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }

  //GET categories stats (Admin)
  static async getStats(req: Request, res: Response) {
    try {
      const stats = await CategoryService.getCategoryStats();
      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message });
    }
  }
}