"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryService = void 0;
const database_1 = __importDefault(require("../config/database"));
class CategoryService {
    // Get all categories
    static async getAllCategories() {
        try {
            const categories = await database_1.default.category.findMany({
                orderBy: { name: 'asc' },
            });
            // Get tutor count for each category
            const categoriesWithStats = await Promise.all(categories.map(async (category) => {
                const categoryName = category.name;
                const tutorCount = await database_1.default.tutorProfile.count({
                    where: {
                        subjects: { has: categoryName },
                    },
                });
                const bookingCount = await database_1.default.booking.count({
                    where: {
                        status: 'COMPLETED',
                        tutor: {
                            tutorProfile: {
                                subjects: { has: categoryName },
                            },
                        },
                    },
                });
                return {
                    id: category.id,
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    createdAt: category.createdAt,
                    tutorCount: tutorCount || 0,
                    bookingCount: bookingCount || 0,
                };
            }));
            return categoriesWithStats;
        }
        catch (error) {
            console.error('Error getting categories:', error);
            throw new Error('Failed to fetch categories');
        }
    }
    // Get category by ID
    static async getCategoryById(categoryId) {
        try {
            // Validate ID
            if (!categoryId) {
                throw new Error('Category ID is required');
            }
            const category = await database_1.default.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                throw new Error('Category not found');
            }
            // Get tutors in this category
            const tutors = await database_1.default.tutorProfile.findMany({
                where: {
                    subjects: { has: category.name },
                    user: {
                        isActive: true,
                    },
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                        },
                    },
                },
                take: 10,
                orderBy: {
                    rating: 'desc',
                },
            });
            // Get statistics
            const totalTutors = await database_1.default.tutorProfile.count({
                where: {
                    subjects: { has: category.name },
                },
            });
            const totalBookings = await database_1.default.booking.count({
                where: {
                    status: 'COMPLETED',
                    tutor: {
                        tutorProfile: {
                            subjects: { has: category.name },
                        },
                    },
                },
            });
            const ratingAggregate = await database_1.default.tutorProfile.aggregate({
                where: {
                    subjects: { has: category.name },
                    rating: { gt: 0 },
                },
                _avg: {
                    rating: true,
                },
            });
            const stats = {
                totalTutors: totalTutors || 0,
                totalBookings: totalBookings || 0,
                averageRating: ratingAggregate._avg.rating || 0,
            };
            return {
                id: category.id,
                name: category.name,
                description: category.description,
                icon: category.icon,
                createdAt: category.createdAt,
                stats,
                tutors: tutors || [],
            };
        }
        catch (error) {
            console.error('Error getting category by ID:', error);
            throw error;
        }
    }
    // Get category by name
    static async getCategoryByName(name) {
        try {
            if (!name) {
                throw new Error('Category name is required');
            }
            const category = await database_1.default.category.findUnique({
                where: { name: name },
            });
            return category;
        }
        catch (error) {
            console.error('Error getting category by name:', error);
            throw new Error('Failed to fetch category');
        }
    }
    // Create new category (Admin only)
    static async createCategory(data) {
        try {
            // Validate name
            if (!data.name || data.name.trim().length === 0) {
                throw new Error('Category name is required');
            }
            // Check if category already exists
            const existingCategory = await database_1.default.category.findUnique({
                where: { name: data.name.trim() },
            });
            if (existingCategory) {
                throw new Error('Category already exists');
            }
            // Create category
            const category = await database_1.default.category.create({
                data: {
                    name: data.name.trim(),
                    description: data.description?.trim() || null,
                    icon: data.icon?.trim() || null,
                },
            });
            return category;
        }
        catch (error) {
            console.error('Error creating category:', error);
            throw error;
        }
    }
    // Update category (Admin only)
    static async updateCategory(categoryId, data) {
        try {
            // Validate ID
            if (!categoryId) {
                throw new Error('Category ID is required');
            }
            // Check if category exists
            const existingCategory = await database_1.default.category.findUnique({
                where: { id: categoryId },
            });
            if (!existingCategory) {
                throw new Error('Category not found');
            }
            // If name is being changed, check for duplicates
            if (data.name && data.name.trim() !== existingCategory.name) {
                const nameExists = await database_1.default.category.findUnique({
                    where: { name: data.name.trim() },
                });
                if (nameExists) {
                    throw new Error('Category name already exists');
                }
            }
            // Update category
            const category = await database_1.default.category.update({
                where: { id: categoryId },
                data: {
                    ...(data.name && { name: data.name.trim() }),
                    ...(data.description !== undefined && { description: data.description?.trim() || null }),
                    ...(data.icon !== undefined && { icon: data.icon?.trim() || null }),
                },
            });
            return category;
        }
        catch (error) {
            console.error('Error updating category:', error);
            throw error;
        }
    }
    // Delete category (Admin only)
    static async deleteCategory(categoryId) {
        try {
            // Validate ID
            if (!categoryId) {
                throw new Error('Category ID is required');
            }
            // Check if category exists
            const category = await database_1.default.category.findUnique({
                where: { id: categoryId },
            });
            if (!category) {
                throw new Error('Category not found');
            }
            // Check if category has any tutors
            const tutorCount = await database_1.default.tutorProfile.count({
                where: {
                    subjects: { has: category.name },
                },
            });
            if (tutorCount > 0) {
                throw new Error(`Cannot delete category with ${tutorCount} tutors. Remove tutors from this category first.`);
            }
            // Delete category
            await database_1.default.category.delete({
                where: { id: categoryId },
            });
            return { message: 'Category deleted successfully' };
        }
        catch (error) {
            console.error('Error deleting category:', error);
            throw error;
        }
    }
    // Get popular categories
    static async getPopularCategories(limit = 6) {
        try {
            const categories = await database_1.default.category.findMany({
                take: limit,
                orderBy: { name: 'asc' },
            });
            const categoriesWithCounts = await Promise.all(categories.map(async (category) => {
                const tutorCount = await database_1.default.tutorProfile.count({
                    where: {
                        subjects: { has: category.name },
                    },
                });
                return {
                    id: category.id,
                    name: category.name,
                    description: category.description,
                    icon: category.icon,
                    tutorCount: tutorCount || 0,
                };
            }));
            // Sort by tutor count (highest first)
            return categoriesWithCounts.sort((a, b) => b.tutorCount - a.tutorCount);
        }
        catch (error) {
            console.error('Error getting popular categories:', error);
            throw new Error('Failed to fetch popular categories');
        }
    }
    // Search categories
    static async searchCategories(searchTerm) {
        try {
            if (!searchTerm) {
                return [];
            }
            const categories = await database_1.default.category.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { description: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                orderBy: { name: 'asc' },
            });
            return categories;
        }
        catch (error) {
            console.error('Error searching categories:', error);
            throw new Error('Failed to search categories');
        }
    }
    // Get category statistics
    static async getCategoryStats() {
        try {
            const totalCategories = await database_1.default.category.count();
            const allCategories = await database_1.default.category.findMany();
            const categoriesWithStats = await Promise.all(allCategories.map(async (category) => {
                const tutorCount = await database_1.default.tutorProfile.count({
                    where: {
                        subjects: { has: category.name },
                    },
                });
                const bookingCount = await database_1.default.booking.count({
                    where: {
                        status: 'COMPLETED',
                        tutor: {
                            tutorProfile: {
                                subjects: { has: category.name },
                            },
                        },
                    },
                });
                return {
                    name: category.name,
                    tutorCount: tutorCount || 0,
                    bookingCount: bookingCount || 0,
                };
            }));
            const mostPopular = categoriesWithStats.length > 0
                ? categoriesWithStats.reduce((max, current) => current.tutorCount > max.tutorCount ? current : max)
                : null;
            return {
                totalCategories: totalCategories || 0,
                categories: categoriesWithStats,
                mostPopular,
            };
        }
        catch (error) {
            console.error('Error getting category stats:', error);
            throw new Error('Failed to fetch category statistics');
        }
    }
    // Bulk create categories 
    static async bulkCreateCategories(categories) {
        try {
            if (!categories || !Array.isArray(categories)) {
                throw new Error('Categories array is required');
            }
            const results = [];
            for (const category of categories) {
                try {
                    if (!category.name) {
                        console.error('Skipping category with no name');
                        continue;
                    }
                    const existing = await database_1.default.category.findUnique({
                        where: { name: category.name.trim() },
                    });
                    if (!existing) {
                        const created = await database_1.default.category.create({
                            data: {
                                name: category.name.trim(),
                                description: category.description?.trim() || null,
                                icon: category.icon?.trim() || null,
                            },
                        });
                        results.push(created);
                    }
                    else {
                        results.push(existing);
                    }
                }
                catch (error) {
                    console.error(`Error creating category ${category.name}:`, error);
                }
            }
            return results;
        }
        catch (error) {
            console.error('Error bulk creating categories:', error);
            throw new Error('Failed to create categories');
        }
    }
}
exports.CategoryService = CategoryService;
//# sourceMappingURL=categoryService.js.map