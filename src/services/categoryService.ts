import prisma from '../config/database';

export class CategoryService {
  // Get all categories
  static async getAllCategories() {
    try {
      const categories = await prisma.category.findMany({
        orderBy: { name: 'asc' },
      });
      
      // Get tutor count for each category
      const categoriesWithStats = await Promise.all(
        categories.map(async (category) => {
          const tutorCount = await prisma.tutorProfile.count({
            where: {
              subjects: { has: category.name },
            },
          });
          
          const bookingCount = await prisma.booking.count({
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
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            createdAt: category.createdAt,
            tutorCount,
            bookingCount,
          };
        })
      );
      
      return categoriesWithStats;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to fetch categories');
    }
  }
  
  // Get category by ID
  static async getCategoryById(categoryId: string) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Get tutors in this category
      const tutors = await prisma.tutorProfile.findMany({
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
      const totalTutors = await prisma.tutorProfile.count({
        where: {
          subjects: { has: category.name },
        },
      });
      
      const totalBookings = await prisma.booking.count({
        where: {
          status: 'COMPLETED',
          tutor: {
            tutorProfile: {
              subjects: { has: category.name },
            },
          },
        },
      });
      
      const ratingAggregate = await prisma.tutorProfile.aggregate({
        where: {
          subjects: { has: category.name },
          rating: { gt: 0 },
        },
        _avg: {
          rating: true,
        },
      });
      
      const stats = {
        totalTutors,
        totalBookings,
        averageRating: ratingAggregate._avg.rating || 0,
      };
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        createdAt: category.createdAt,
        stats,
        tutors,
      };
    } catch (error) {
      console.error('Error getting category by ID:', error);
      throw error;
    }
  }
  
  // Get category by name
  static async getCategoryByName(name: string) {
    try {
      const category = await prisma.category.findUnique({
        where: { name },
      });
      
      return category;
    } catch (error) {
      console.error('Error getting category by name:', error);
      throw new Error('Failed to fetch category');
    }
  }
  
  // Create new category (Admin only)
  static async createCategory(data: {
    name: string;
    description?: string;
    icon?: string;
  }) {
    try {
      // Check if category already exists
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
      });
      
      if (existingCategory) {
        throw new Error('Category already exists');
      }
      
      // Validate name
      if (!data.name || data.name.trim().length === 0) {
        throw new Error('Category name is required');
      }
      
      // Create category
      const category = await prisma.category.create({
        data: {
          name: data.name.trim(),
          description: data.description || null,
          icon: data.icon || null,
        },
      });
      
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }
  
  // Update category (Admin only)
  static async updateCategory(
    categoryId: string,
    data: {
      name?: string;
      description?: string;
      icon?: string;
    }
  ) {
    try {
      // Check if category exists
      const existingCategory = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      
      if (!existingCategory) {
        throw new Error('Category not found');
      }
      
      // If name is being changed, check for duplicates
      if (data.name && data.name !== existingCategory.name) {
        const nameExists = await prisma.category.findUnique({
          where: { name: data.name },
        });
        
        if (nameExists) {
          throw new Error('Category name already exists');
        }
      }
      
      // Update category
      const category = await prisma.category.update({
        where: { id: categoryId },
        data: {
          ...(data.name && { name: data.name.trim() }),
          ...(data.description !== undefined && { description: data.description }),
          ...(data.icon !== undefined && { icon: data.icon }),
        },
      });
      
      return category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }
  
  // Delete category (Admin only)
  static async deleteCategory(categoryId: string) {
    try {
      // Check if category exists
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });
      
      if (!category) {
        throw new Error('Category not found');
      }
      
      // Check if category has any tutors
      const tutorCount = await prisma.tutorProfile.count({
        where: {
          subjects: { has: category.name },
        },
      });
      
      if (tutorCount > 0) {
        throw new Error(`Cannot delete category with ${tutorCount} tutors. Remove tutors from this category first.`);
      }
      
      // Delete category
      await prisma.category.delete({
        where: { id: categoryId },
      });
      
      return { message: 'Category deleted successfully' };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
  
  // Get popular categories
  static async getPopularCategories(limit: number = 6) {
    try {
      const categories = await prisma.category.findMany({
        take: limit,
        orderBy: { name: 'asc' },
      });
      
      const categoriesWithCounts = await Promise.all(
        categories.map(async (category) => {
          const tutorCount = await prisma.tutorProfile.count({
            where: {
              subjects: { has: category.name },
            },
          });
          
          return {
            id: category.id,
            name: category.name,
            description: category.description,
            icon: category.icon,
            tutorCount,
          };
        })
      );
      
      // Sort by tutor count
      return categoriesWithCounts.sort((a, b) => b.tutorCount - a.tutorCount);
    } catch (error) {
      console.error('Error getting popular categories:', error);
      throw new Error('Failed to fetch popular categories');
    }
  }
  
  // Search categories
  static async searchCategories(searchTerm: string) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          OR: [
            { name: { contains: searchTerm, mode: 'insensitive' } },
            { description: { contains: searchTerm, mode: 'insensitive' } },
          ],
        },
        orderBy: { name: 'asc' },
      });
      
      return categories;
    } catch (error) {
      console.error('Error searching categories:', error);
      throw new Error('Failed to search categories');
    }
  }
  
  // Get category statistics
  static async getCategoryStats() {
    try {
      const totalCategories = await prisma.category.count();
      
      const allCategories = await prisma.category.findMany();
      
      const categoriesWithStats = await Promise.all(
        allCategories.map(async (category) => {
          const tutorCount = await prisma.tutorProfile.count({
            where: {
              subjects: { has: category.name },
            },
          });
          
          const bookingCount = await prisma.booking.count({
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
            tutorCount,
            bookingCount,
          };
        })
      );
      
      const mostPopular = categoriesWithStats.length > 0 
        ? categoriesWithStats.reduce((max, current) => 
            current.tutorCount > max.tutorCount ? current : max
          )
        : null;
      
      return {
        totalCategories,
        categories: categoriesWithStats,
        mostPopular,
      };
    } catch (error) {
      console.error('Error getting category stats:', error);
      throw new Error('Failed to fetch category statistics');
    }
  }
  
  // Bulk create categories 
  static async bulkCreateCategories(categories: Array<{
    name: string;
    description?: string;
    icon?: string;
  }>) {
    try {
      const results = [];
      
      for (const category of categories) {
        try {
          const existing = await prisma.category.findUnique({
            where: { name: category.name },
          });
          
          if (!existing) {
            const created = await prisma.category.create({
              data: {
                name: category.name,
                description: category.description || null,
                icon: category.icon || null,
              },
            });
            results.push(created);
          } else {
            results.push(existing);
          }
        } catch (error) {
          console.error(`Error creating category ${category.name}:`, error);
        }
      }
      
      return results;
    } catch (error) {
      console.error('Error bulk creating categories:', error);
      throw new Error('Failed to create categories');
    }
  }
}