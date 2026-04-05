import { Router } from 'express';
import { CategoryController } from '../controllers/categoryController';
import { authMiddleware, roleMiddleware } from '../middleware/auth';

const router = Router();

// Get all categories
router.get('/', CategoryController.getAllCategories);

router.get('/search', CategoryController.searchCategories);
router.get('/popular', CategoryController.getPopularCategories);
router.get('/stats', CategoryController.getStats);

router.get('/:id', CategoryController.getCategoryById);

// Admin Routes
router.post(
  '/',
  authMiddleware,
  roleMiddleware('ADMIN'),
  CategoryController.createCategory
);

router.patch(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  CategoryController.updateCategory
);

router.delete(
  '/:id',
  authMiddleware,
  roleMiddleware('ADMIN'),
  CategoryController.deleteCategory
);

export default router;