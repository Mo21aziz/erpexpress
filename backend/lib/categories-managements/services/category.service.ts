import { CategoryRepository } from "../repositories/category.repository";
import { Category } from "../../../types/category";
import { IQueryObject } from "../../../prisma/interfaces/query-params";
import { PrismaClient } from "@prisma/client";
import { Paginated } from "../../../prisma/interfaces/pagination";

export class CategoryService {
  private categoryRepository: CategoryRepository;

  constructor(categoryRepository: CategoryRepository, prisma: PrismaClient) {
    this.categoryRepository = categoryRepository;
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

  async updateCategory(
    id: string,
    data: Partial<Category>
  ): Promise<Category> {
    return this.categoryRepository.update(id, data);
  }

  async deleteCategory(id: string): Promise<Category> {
    return this.categoryRepository.delete(id);
  }

  async softDeleteCategory(id: string): Promise<Category> {
    return this.categoryRepository.softDelete(id);
  }
}