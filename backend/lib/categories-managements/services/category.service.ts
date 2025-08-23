import { CategoryRepository } from "../repositories/category.repository";
import { Category } from "../../../types/category";
import { IQueryObject } from "../../../prisma/interfaces/query-params";
import { PrismaClient } from "@prisma/client";
import { Paginated } from "../../../prisma/interfaces/pagination";

export class CategoryService {
  private categoryRepository: CategoryRepository;
  private prisma: PrismaClient;

  constructor(categoryRepository: CategoryRepository, prisma: PrismaClient) {
    this.categoryRepository = categoryRepository;
    this.prisma = prisma;
  }

  async getCategories(queryObject?: IQueryObject): Promise<Category[]> {
    return this.categoryRepository.findByCondition(queryObject || {});
  }

  async getPaginatedCategories(
    queryObject: IQueryObject
  ): Promise<Paginated<Category>> {
    return this.categoryRepository.findPaginated(queryObject);
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return this.categoryRepository.findById(id);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.categoryRepository.create(data);
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string): Promise<Category> {
    // Check if category has associated articles
    const articles = await this.prisma.article.findMany({
      where: { category_id: id },
    });

    if (articles.length > 0) {
      throw new Error(
        `Cannot delete category. It has ${articles.length} associated articles. Please delete the articles first.`
      );
    }

    // Check if category has associated bon de commande entries
    const bonDeCommandeEntries =
      await this.prisma.bonDeCommandeCategory.findMany({
        where: { category_id: id },
      });

    if (bonDeCommandeEntries.length > 0) {
      throw new Error(
        `Cannot delete category. It has ${bonDeCommandeEntries.length} associated bon de commande entries. Please delete the bon de commande entries first.`
      );
    }

    return this.categoryRepository.delete(id);
  }

  async softDeleteCategory(id: string): Promise<Category> {
    return this.categoryRepository.softDelete(id);
  }

  async deleteCategoryWithCascade(id: string): Promise<Category> {
    // Delete all associated articles first
    await this.prisma.article.deleteMany({
      where: { category_id: id },
    });

    // Delete all associated bon de commande entries
    await this.prisma.bonDeCommandeCategory.deleteMany({
      where: { category_id: id },
    });

    // Now delete the category
    return this.categoryRepository.delete(id);
  }
}
